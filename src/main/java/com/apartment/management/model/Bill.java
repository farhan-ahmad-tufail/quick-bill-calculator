package com.apartment.management.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Document(collection = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bill {
    @Id
    private String id;

    @DBRef
    private Tenant tenant;

    @DBRef
    private Room room;

    private LocalDate billDate;

    // Storing month as string "YYYY-MM"
    private String billingMonth;

    private BigDecimal rentAmount;

    private BigDecimal currentReading;
    private BigDecimal previousReading;
    private BigDecimal unitsConsumed;
    private BigDecimal electricityAmount;

    private BigDecimal previousBalance;

    private BigDecimal totalAmount;
    private BigDecimal paidAmount = BigDecimal.ZERO;

    private BillStatus status = BillStatus.UNPAID;
}
