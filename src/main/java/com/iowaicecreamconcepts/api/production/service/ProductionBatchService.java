package com.iowaicecreamconcepts.api.production.service;

import com.iowaicecreamconcepts.api.production.model.ProductionBatch;
import com.iowaicecreamconcepts.api.production.repository.ProductionBatchRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProductionBatchService {

    private final ProductionBatchRepository repo;

    public ProductionBatchService(ProductionBatchRepository repo) {
        this.repo = repo;
    }

    public ProductionBatch requestBatch(String flavor, LocalDate neededBy) {
        return repo.save(
                ProductionBatch.builder()
                        .flavor(flavor)
                        .dateRequested(LocalDate.now())
                        .dateNeededBy(neededBy)
                        .status(ProductionBatch.Status.REQUESTED)
                        .build()
        );
    }

    public ProductionBatch markProduced(Long id, String producedBy, LocalDate dateProduced) {
        return repo.findById(id).map(batch -> {
            batch.setStatus(ProductionBatch.Status.PRODUCED);
            batch.setDateProduced(dateProduced != null ? dateProduced : LocalDate.now());
            batch.setProducedBy(producedBy);
            return repo.save(batch);
        }).orElseThrow();
    }

    public ProductionBatch markUsedUp(Long id) {
        return repo.findById(id).map(batch -> {
            batch.setStatus(ProductionBatch.Status.DEPLETED);
            batch.setDateUsedUp(LocalDate.now());
            return repo.save(batch);
        }).orElseThrow();
    }

    public ProductionBatch discard(Long id, String reason, LocalDate dateDiscarded) {
        return repo.findById(id).map(batch -> {
            batch.setStatus(ProductionBatch.Status.DISCARDED);
            batch.setDiscardReason(reason);
            batch.setDateDiscarded(dateDiscarded != null ? dateDiscarded : LocalDate.now());
            return repo.save(batch);
        }).orElseThrow();
    }

    public List<ProductionBatch> listAll() {
        return repo.findAll();
    }
}
