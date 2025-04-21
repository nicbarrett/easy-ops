package com.iowaicecreamconcepts.api.inventory.repository;

import com.iowaicecreamconcepts.api.inventory.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findByNameContainingIgnoreCase(String name);
}