package com.apartment.management.repository;

import com.apartment.management.model.Bill;
import com.apartment.management.model.BillStatus;
import com.apartment.management.model.Tenant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends MongoRepository<Bill, String> {
    List<Bill> findByTenant(Tenant tenant);

    List<Bill> findByTenantAndStatusNot(Tenant tenant, BillStatus status);

    // Find the latest bill for a tenant
    Optional<Bill> findFirstByTenantOrderByBillDateDesc(Tenant tenant);
}
