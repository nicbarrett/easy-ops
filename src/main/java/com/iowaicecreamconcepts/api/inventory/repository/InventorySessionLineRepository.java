package com.iowaicecreamconcepts.api.inventory.repository;

import com.iowaicecreamconcepts.api.inventory.model.InventorySessionLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventorySessionLineRepository extends JpaRepository<InventorySessionLine, UUID> {
    
    List<InventorySessionLine> findBySessionIdOrderByCreatedAt(UUID sessionId);
    
    void deleteBySessionId(UUID sessionId);
}