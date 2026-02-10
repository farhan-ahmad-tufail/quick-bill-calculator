package com.apartment.management.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataMigration implements CommandLineRunner {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Drop the old index on meterSerialNumber if it exists
            mongoTemplate.indexOps("rooms").dropIndex("meterSerialNumber");
            System.out.println("Successfully dropped old index: meterSerialNumber");
        } catch (Exception e) {
            // Index might not exist, which is fine
            System.out.println("No index to drop or error dropping index: " + e.getMessage());
        }
    }
}
