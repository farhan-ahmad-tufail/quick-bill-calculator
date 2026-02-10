package com.apartment.management.controller;

import com.apartment.management.model.Bill;
import com.apartment.management.repository.BillRepository;
import com.apartment.management.service.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillingController {

    @Autowired
    private BillingService billingService;

    @Autowired
    private BillRepository billRepository;

    @PostMapping("/generate")
    public Bill generateBill(
            @RequestParam String roomId,
            @RequestParam BigDecimal currentReading,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) BigDecimal previousBalance,
            @RequestParam(required = false) BigDecimal previousReading) {
        return billingService.generateBill(roomId, currentReading, month, year, previousBalance, previousReading);
    }

    @GetMapping
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }
}
