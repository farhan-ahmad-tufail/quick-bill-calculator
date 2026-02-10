package com.apartment.management.controller;

import com.apartment.management.model.Room;
import com.apartment.management.model.Tenant;
import com.apartment.management.repository.RoomRepository;
import com.apartment.management.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tenants")
@CrossOrigin(origins = "*")
public class TenantController {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private RoomRepository roomRepository;

    @PostMapping
    public Tenant onboardTenant(@RequestBody Tenant tenant, @RequestParam String roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        tenant.setRoom(room);
        if (tenant.getJoinedDate() == null) {
            tenant.setJoinedDate(LocalDate.now());
        }
        return tenantRepository.save(tenant);
    }

    @GetMapping
    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    @PutMapping("/{id}")
    public Tenant updateTenant(@PathVariable String id, @RequestBody Tenant tenantDetails,
            @RequestParam(required = false) String roomId) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found with id: " + id));

        tenant.setName(tenantDetails.getName());
        tenant.setMobile(tenantDetails.getMobile());
        tenant.setJoinedDate(tenantDetails.getJoinedDate());
        tenant.setActive(tenantDetails.isActive());

        if (roomId != null && !roomId.isEmpty()) {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found"));
            tenant.setRoom(room);
        }

        return tenantRepository.save(tenant);
    }

    @DeleteMapping("/{id}")
    public void deleteTenant(@PathVariable String id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found with id: " + id));
        tenantRepository.delete(tenant);
    }
}
