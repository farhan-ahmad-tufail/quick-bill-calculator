package com.apartment.management.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Document(collection = "meter_readings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeterReading {
    @Id
    private String id;

    @DBRef
    private Room room;

    private BigDecimal readingValue;

    private LocalDate readingDate;

    @DBRef
    private Bill bill;
}
