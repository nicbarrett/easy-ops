package com.iowaicecreamconcepts.api.production.controller;

import com.iowaicecreamconcepts.api.production.dto.*;
import com.iowaicecreamconcepts.api.production.model.ProductionBatch;
import com.iowaicecreamconcepts.api.production.service.ProductionBatchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/batches")
@CrossOrigin
public class ProductionBatchController {

    private final ProductionBatchService service;

    public ProductionBatchController(ProductionBatchService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProductionBatch> requestBatch(@Valid @RequestBody ProductionBatchRequest request) {
        return ResponseEntity.ok(service.requestBatch(request.getFlavor(), request.getDateNeededBy()));
    }

    @PutMapping("/{id}/produce")
    public ResponseEntity<ProductionBatch> markProduced(@PathVariable Long id,
                                                        @RequestBody ProductionUpdateRequest request) {
        return ResponseEntity.ok(service.markProduced(id, request.getProducedBy(), request.getDateProduced()));
    }

    @PutMapping("/{id}/used-up")
    public ResponseEntity<ProductionBatch> markUsedUp(@PathVariable Long id) {
        return ResponseEntity.ok(service.markUsedUp(id));
    }

    @PutMapping("/{id}/discard")
    public ResponseEntity<ProductionBatch> discard(@PathVariable Long id,
                                                   @RequestBody DiscardBatchRequest request) {
        return ResponseEntity.ok(service.discard(id, request.getReason(), request.getDateDiscarded()));
    }

    @GetMapping
    public List<ProductionBatch> listAll() {
        return service.listAll();
    }
}
