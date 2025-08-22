package com.iowaicecreamconcepts.api.production.controller;

import com.iowaicecreamconcepts.api.production.dto.*;
import com.iowaicecreamconcepts.api.production.model.ProductionBatch;
import com.iowaicecreamconcepts.api.production.service.ProductionBatchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/production/batch")
@CrossOrigin
public class ProductionBatchController {

    private final ProductionBatchService service;

    public ProductionBatchController(ProductionBatchService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductionBatch> getBatch(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getBatch(id));
    }

    @GetMapping("/all")
    public List<ProductionBatch> listAll() {
        return service.listAll();
    }
}
