package com.iowaicecreamconcepts.api.production.service;

import com.iowaicecreamconcepts.api.production.model.ProductionRequest;
import com.iowaicecreamconcepts.api.production.repository.ProductionRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductionRequestService {

    private final ProductionRequestRepository productionRequestRepository;

    public ProductionRequest createRequest(UUID productItemId, UUID locationId, UUID requestedBy, 
                                         LocalDateTime neededBy, Double targetQuantity, String unit,
                                         ProductionRequest.Priority priority, String reason) {
        
        ProductionRequest request = ProductionRequest.builder()
                .productItemId(productItemId)
                .locationId(locationId)
                .requestedBy(requestedBy)
                .neededBy(neededBy)
                .targetQuantity(targetQuantity)
                .unit(unit)
                .priority(priority)
                .reason(reason)
                .build();

        return productionRequestRepository.save(request);
    }

    public List<ProductionRequest> getRequestsByStatus(ProductionRequest.Status status) {
        return productionRequestRepository.findByStatusOrderByNeededByAsc(status);
    }

    public List<ProductionRequest> getRequestsByLocationAndStatus(UUID locationId, ProductionRequest.Status status) {
        return productionRequestRepository.findByLocationIdAndStatusOrderByNeededByAsc(locationId, status);
    }

    public List<ProductionRequest> getOverdueRequests() {
        return productionRequestRepository.findOverdueRequests(LocalDateTime.now());
    }

    public ProductionRequest getRequest(UUID requestId) {
        return productionRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Production request not found"));
    }

    public ProductionRequest updateRequestStatus(UUID requestId, ProductionRequest.Status status) {
        ProductionRequest request = getRequest(requestId);
        request.setStatus(status);
        return productionRequestRepository.save(request);
    }

    public void deleteRequest(UUID requestId) {
        ProductionRequest request = getRequest(requestId);
        if (request.getStatus() != ProductionRequest.Status.OPEN) {
            throw new RuntimeException("Cannot delete request that is not in OPEN status");
        }
        productionRequestRepository.deleteById(requestId);
    }
}