package com.apartment.management.repository;

import com.apartment.management.model.MeterReading;
import com.apartment.management.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MeterReadingRepository extends MongoRepository<MeterReading, String> {
    Optional<MeterReading> findTopByRoomOrderByReadingDateDesc(Room room);
}
