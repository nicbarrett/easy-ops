package com.iowaicecreamconcepts.api.inventory.service;

import com.iowaicecreamconcepts.api.inventory.model.InventoryItem;
import com.iowaicecreamconcepts.api.inventory.repository.InventoryItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    private final InventoryItemRepository repository;

    public InventoryService(InventoryItemRepository repository) {
        this.repository = repository;
    }

    public List<InventoryItem> getAllItems() {
        return repository.findAll();
    }

    public Optional<InventoryItem> getItemById(Long id) {
        return repository.findById(id);
    }

    public InventoryItem createItem(InventoryItem item) {
        return repository.save(item);
    }

    public InventoryItem updateItem(Long id, InventoryItem updatedItem) {
        return repository.findById(id)
                .map(item -> {
                    item.setName(updatedItem.getName());
                    item.setUnit(updatedItem.getUnit());
                    item.setMinStockLevel(updatedItem.getMinStockLevel());
                    item.setSupplier(updatedItem.getSupplier());
                    return repository.save(item);
                }).orElseThrow(() -> new RuntimeException("Item not found"));
    }

    public void deleteItem(Long id) {
        repository.deleteById(id);
    }
}