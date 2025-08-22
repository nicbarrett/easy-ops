package com.iowaicecreamconcepts.api.production.repository;

import com.iowaicecreamconcepts.api.production.model.ProductionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductionRequestRepository extends JpaRepository<ProductionRequest, UUID> {
    
    List<ProductionRequest> findByStatusOrderByNeededByAsc(ProductionRequest.Status status);
    
    List<ProductionRequest> findByLocationIdAndStatusOrderByNeededByAsc(UUID locationId, ProductionRequest.Status status);
    
    @Query("SELECT pr FROM ProductionRequest pr WHERE pr.neededBy < :date AND pr.status IN ('OPEN', 'IN_PROGRESS')")
    List<ProductionRequest> findOverdueRequests(@Param("date") LocalDateTime date);
    
    List<ProductionRequest> findByRequestedByOrderByCreatedAtDesc(UUID requestedBy);
}