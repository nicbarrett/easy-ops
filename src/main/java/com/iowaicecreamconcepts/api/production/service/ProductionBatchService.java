package com.iowaicecreamconcepts.api.production.service;

import com.iowaicecreamconcepts.api.production.model.ProductionBatch;
import com.iowaicecreamconcepts.api.production.repository.ProductionBatchRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ProductionBatchService {

    private final ProductionBatchRepository repo;

    public ProductionBatchService(ProductionBatchRepository repo) {
        this.repo = repo;
    }

    public List<ProductionBatch> listAll() {
        return repo.findAll();
    }

    public List<ProductionBatch> getBatchesByStatus(ProductionBatch.Status status) {
        return repo.findByStatusOrderByCreatedAtDesc(status);
    }

    public ProductionBatch getBatch(UUID id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Production batch not found"));
    }
}
