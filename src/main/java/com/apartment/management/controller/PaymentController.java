package com.apartment.management.controller;

import com.apartment.management.model.Payment;
import com.apartment.management.repository.PaymentRepository;
import com.apartment.management.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentRepository paymentRepository;

    @PostMapping
    public Payment recordPayment(@RequestParam String billId,
            @RequestParam BigDecimal amount,
            @RequestParam String mode) {
        return paymentService.recordPayment(billId, amount, mode);
    }

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
}
