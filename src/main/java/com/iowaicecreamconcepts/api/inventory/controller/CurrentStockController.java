package com.iowaicecreamconcepts.api.inventory.controller;

import com.iowaicecreamconcepts.api.inventory.model.CurrentStock;
import com.iowaicecreamconcepts.api.inventory.repository.CurrentStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory/current")
@RequiredArgsConstructor
public class CurrentStockController {

    private final CurrentStockRepository currentStockRepository;

    @GetMapping
    public ResponseEntity<List<CurrentStock>> getCurrentStock(@RequestParam(required = false) UUID locationId) {
        if (locationId != null) {
            return ResponseEntity.ok(currentStockRepository.findByLocationId(locationId));
        }
        return ResponseEntity.ok(currentStockRepository.findAll());
    }

    @GetMapping("/below-par")
    public ResponseEntity<List<CurrentStock>> getBelowParStock(@RequestParam(required = false) UUID locationId) {
        if (locationId != null) {
            return ResponseEntity.ok(currentStockRepository.findBelowParStockByLocation(locationId));
        }
        return ResponseEntity.ok(currentStockRepository.findBelowParStock());
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<CurrentStock>> getCurrentStockByItem(@PathVariable UUID itemId) {
        return ResponseEntity.ok(currentStockRepository.findByItemId(itemId));
    }
}