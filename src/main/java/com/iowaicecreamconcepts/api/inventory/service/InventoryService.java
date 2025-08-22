package com.iowaicecreamconcepts.api.inventory.service;

import com.iowaicecreamconcepts.api.inventory.model.InventoryItem;
import com.iowaicecreamconcepts.api.inventory.repository.InventoryItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InventoryService {

    private final InventoryItemRepository repository;

    public InventoryService(InventoryItemRepository repository) {
        this.repository = repository;
    }

    public List<InventoryItem> getAllItems() {
        return repository.findByIsActiveTrueOrderByName();
    }

    public Optional<InventoryItem> getItemById(UUID id) {
        return repository.findById(id);
    }

    public InventoryItem createItem(InventoryItem item) {
        if (repository.existsByName(item.getName())) {
            throw new RuntimeException("Item with this name already exists");
        }
        return repository.save(item);
    }

    public InventoryItem updateItem(UUID id, InventoryItem updatedItem) {
        return repository.findById(id)
                .map(item -> {
                    item.setName(updatedItem.getName());
                    item.setCategory(updatedItem.getCategory());
                    item.setUnit(updatedItem.getUnit());
                    item.setParStockLevel(updatedItem.getParStockLevel());
                    item.setDefaultLocationId(updatedItem.getDefaultLocationId());
                    item.setSku(updatedItem.getSku());
                    item.setNotes(updatedItem.getNotes());
                    return repository.save(item);
                }).orElseThrow(() -> new RuntimeException("Item not found"));
    }

    public void deleteItem(UUID id) {
        InventoryItem item = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setIsActive(false);
        repository.save(item);
    }

    public List<InventoryItem> getItemsByCategory(InventoryItem.Category category) {
        return repository.findByCategory(category);
    }

    public List<InventoryItem> getItemsByLocation(UUID locationId) {
        return repository.findByDefaultLocationId(locationId);
    }
}