package com.iowaicecreamconcepts.api.production.repository;

import com.iowaicecreamconcepts.api.production.model.ProductionBatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductionBatchRepository extends JpaRepository<ProductionBatch, Long> {
    List<ProductionBatch> findByStatus(ProductionBatch.Status status);
}
