package com.iowaicecreamconcepts.api.inventory.repository;

import com.iowaicecreamconcepts.api.inventory.model.InventorySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventorySessionRepository extends JpaRepository<InventorySession, UUID> {
    
    List<InventorySession> findByLocationIdOrderByStartedAtDesc(UUID locationId);
    
    List<InventorySession> findByStatusOrderByStartedAtDesc(InventorySession.Status status);
}