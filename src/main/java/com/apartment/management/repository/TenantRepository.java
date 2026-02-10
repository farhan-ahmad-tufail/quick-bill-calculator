package com.apartment.management.repository;

import com.apartment.management.model.Tenant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TenantRepository extends MongoRepository<Tenant, String> {
    List<Tenant> findByIsActiveTrue();

    Optional<Tenant> findByMobile(String mobile);
}
