package com.apartment.management.service;

import com.apartment.management.model.*;
import com.apartment.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class BillingService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private MeterReadingRepository meterReadingRepository;

    private static final BigDecimal UNIT_PRICE = new BigDecimal("17.0");

    public Bill generateBill(String roomId, BigDecimal currentReading, String month, String year,
            BigDecimal forcedBalance, BigDecimal forcedPreviousReading) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Find active tenant for the room
        Tenant tenant = tenantRepository.findByIsActiveTrue().stream()
                .filter(t -> t.getRoom().getId().equals(roomId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No active tenant found for this room"));

        // 1. Get Last Reading (or use forced)
        BigDecimal lastReadingValue;
        if (forcedPreviousReading != null) {
            lastReadingValue = forcedPreviousReading;
        } else {
            lastReadingValue = meterReadingRepository.findTopByRoomOrderByReadingDateDesc(room)
                    .map(MeterReading::getReadingValue)
                    .orElse(BigDecimal.ZERO);
        }

        // Validation
        if (currentReading.compareTo(lastReadingValue) < 0) {
            throw new RuntimeException("Current reading cannot be less than last reading");
        }

        // 2. Calculate Units & Electricity Cost
        BigDecimal unitsConsumed = currentReading.subtract(lastReadingValue);
        BigDecimal electricityCost = unitsConsumed.multiply(UNIT_PRICE);

        // 3. Calculate Previous Balance (Carry Forward)
        BigDecimal previousBalance;
        if (forcedBalance != null) {
            previousBalance = forcedBalance;
        } else {
            // Auto-calculate if not provided
            Optional<Bill> lastBillOpt = billRepository.findFirstByTenantOrderByBillDateDesc(tenant);
            previousBalance = BigDecimal.ZERO;
            if (lastBillOpt.isPresent()) {
                Bill lastBill = lastBillOpt.get();
                BigDecimal pending = lastBill.getTotalAmount().subtract(lastBill.getPaidAmount());
                if (pending.compareTo(BigDecimal.ZERO) > 0) {
                    previousBalance = pending;
                }
            }
        }

        // 4. Create Bill
        Bill bill = new Bill();
        bill.setTenant(tenant);
        bill.setRoom(room);
        bill.setBillDate(LocalDate.now()); // Date of generation

        // Construct Billing Month string (e.g. "February 2026")
        String billMonthStr = (month != null && year != null) ? month + " " + year
                : LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM yyyy"));
        bill.setBillingMonth(billMonthStr);

        bill.setRentAmount(room.getBaseRent());

        bill.setCurrentReading(currentReading);
        bill.setPreviousReading(lastReadingValue);
        bill.setUnitsConsumed(unitsConsumed);
        bill.setElectricityAmount(electricityCost);

        bill.setPreviousBalance(previousBalance);

        // Total = Rent + Elec + Previous Balance + other(0)
        BigDecimal total = room.getBaseRent().add(electricityCost).add(previousBalance);
        bill.setTotalAmount(total);

        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setStatus(BillStatus.UNPAID);

        Bill savedBill = billRepository.save(bill);

        // 5. Save Meter Reading Record
        MeterReading reading = new MeterReading();
        reading.setRoom(room);
        reading.setReadingValue(currentReading);
        reading.setReadingDate(LocalDate.now());
        reading.setBill(savedBill);
        meterReadingRepository.save(reading);

        // 6. Update Room's Submeter Reading to keep it in sync
        room.setSubmeterReading(currentReading.toString());
        roomRepository.save(room);

        return savedBill;
    }
}
