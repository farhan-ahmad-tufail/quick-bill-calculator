package com.apartment.management.service;

import com.apartment.management.model.Bill;
import com.apartment.management.model.BillStatus;
import com.apartment.management.model.Payment;
import com.apartment.management.repository.BillRepository;
import com.apartment.management.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class PaymentService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public Payment recordPayment(String billId, BigDecimal amount, String mode) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment amount must be positive");
        }

        // 1. Create Payment Record
        Payment payment = new Payment();
        payment.setBill(bill);
        payment.setAmount(amount);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentMode(mode);

        Payment savedPayment = paymentRepository.save(payment);

        // 2. Update Bill Paid Amount
        BigDecimal currentPaid = bill.getPaidAmount() != null ? bill.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal newPaidTotal = currentPaid.add(amount);
        bill.setPaidAmount(newPaidTotal);

        // 3. Update Status
        if (newPaidTotal.compareTo(bill.getTotalAmount()) >= 0) {
            bill.setStatus(BillStatus.PAID);
        } else {
            bill.setStatus(BillStatus.PARTIAL);
        }

        billRepository.save(bill);

        return savedPayment;
    }
}
