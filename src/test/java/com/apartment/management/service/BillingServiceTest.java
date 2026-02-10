package com.apartment.management.service;

import com.apartment.management.model.*;
import com.apartment.management.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class BillingServiceTest {

        @Mock
        private RoomRepository roomRepository;
        @Mock
        private TenantRepository tenantRepository;
        @Mock
        private BillRepository billRepository;
        @Mock
        private MeterReadingRepository meterReadingRepository;

        @InjectMocks
        private BillingService billingService;

        @Test
        public void testBillGenerationWithCarryForward() {
                // Setup Room
                Room room = new Room();
                room.setId("1");
                room.setBaseRent(new BigDecimal("5000"));

                // Setup Tenant
                Tenant tenant = new Tenant();
                tenant.setId("1");
                tenant.setRoom(room); // Simplified for test

                // Mock Repositories
                when(roomRepository.findById("1")).thenReturn(Optional.of(room));
                when(tenantRepository.findByIsActiveTrue()).thenReturn(List.of(tenant));

                // Mock Last Reading (100)
                MeterReading lastReading = new MeterReading();
                lastReading.setReadingValue(new BigDecimal("100"));
                when(meterReadingRepository.findTopByRoomOrderByReadingDateDesc(room))
                                .thenReturn(Optional.of(lastReading));

                // Mock Previous Bill (Total 6000, Paid 4000 -> 2000 Balance)
                Bill lastBill = new Bill();
                lastBill.setTotalAmount(new BigDecimal("6000"));
                lastBill.setPaidAmount(new BigDecimal("4000")); // 2000 pending
                when(billRepository.findFirstByTenantOrderByBillDateDesc(tenant))
                                .thenReturn(Optional.of(lastBill));

                // Mock Save
                when(billRepository.save(any(Bill.class))).thenAnswer(i -> i.getArguments()[0]);

                // Execute: Current Reading 200 (100 units used)
                BigDecimal currentReading = new BigDecimal("200");
                Bill generatedBill = billingService.generateBill("1", currentReading, null, null, null, null);

                // Verify
                assertEquals(new BigDecimal("2000"), generatedBill.getPreviousBalance(),
                                "Previous balance should be 2000");

                BigDecimal expectedElec = new BigDecimal("100").multiply(new BigDecimal("17.0")); // 1700
                assertEquals(expectedElec, generatedBill.getElectricityAmount(), "Electricity cost should be 1700");

                BigDecimal expectedTotal = new BigDecimal("5000") // Rent
                                .add(expectedElec) // 1700
                                .add(new BigDecimal("2000")); // Prev
                // Total = 8700
                assertEquals(expectedTotal, generatedBill.getTotalAmount(), "Total should be 8700");
        }
}
