package com.iowaicecreamconcepts.api.inventory.repository;

import com.iowaicecreamconcepts.api.inventory.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, UUID> {
    
    List<InventoryItem> findByNameContainingIgnoreCase(String name);
    
    List<InventoryItem> findByCategory(InventoryItem.Category category);
    
    List<InventoryItem> findByIsActiveTrueOrderByName();
    
    List<InventoryItem> findByDefaultLocationId(UUID locationId);
    
    boolean existsByName(String name);
}