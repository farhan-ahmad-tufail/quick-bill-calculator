package com.apartment.management.repository;

import com.apartment.management.model.Payment;
import com.apartment.management.model.Bill;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByBill(Bill bill);
}
