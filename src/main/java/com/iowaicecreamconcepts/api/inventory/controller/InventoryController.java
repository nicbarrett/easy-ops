package com.iowaicecreamconcepts.api.inventory.controller;

import com.iowaicecreamconcepts.api.inventory.dto.InventoryItemRequest;
import com.iowaicecreamconcepts.api.inventory.model.InventoryItem;
import com.iowaicecreamconcepts.api.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin // enable CORS for frontend dev
public class InventoryController {

    private final InventoryService service;

    public InventoryController(InventoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<InventoryItem> getAllItems() {
        return service.getAllItems();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryItem> getItemById(@PathVariable Long id) {
        return service.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<InventoryItem> createItem(@Valid @RequestBody InventoryItemRequest itemRequest) {
        InventoryItem item = InventoryItem.fromRequest(itemRequest);
        return ResponseEntity.ok(service.createItem(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryItem> updateItem(@PathVariable Long id, @Valid @RequestBody InventoryItemRequest itemRequest) {
        InventoryItem item = InventoryItem.fromRequest(itemRequest);
        return ResponseEntity.ok(service.updateItem(id, item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        service.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}