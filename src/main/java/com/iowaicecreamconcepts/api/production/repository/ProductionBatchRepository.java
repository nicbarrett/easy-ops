package com.iowaicecreamconcepts.api.production.repository;

import com.iowaicecreamconcepts.api.production.model.ProductionBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductionBatchRepository extends JpaRepository<ProductionBatch, UUID> {
    
    List<ProductionBatch> findByStatusOrderByCreatedAtDesc(ProductionBatch.Status status);
    
    List<ProductionBatch> findByProductItemIdOrderByCreatedAtDesc(UUID productItemId);
    
    List<ProductionBatch> findByStorageLocationIdOrderByCreatedAtDesc(UUID storageLocationId);
    
    long countByLotCodeStartingWith(String prefix);
}
