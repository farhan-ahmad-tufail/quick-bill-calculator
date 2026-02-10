package com.apartment.management.repository;

import com.apartment.management.model.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RoomRepository extends MongoRepository<Room, String> {
    Optional<Room> findByRoomNumber(String roomNumber);

    Optional<Room> findBySubmeterReading(String submeterReading);
}
