package com.iowaicecreamconcepts.api.production.controller;

import com.iowaicecreamconcepts.api.production.model.ProductionRequest;
import com.iowaicecreamconcepts.api.production.service.ProductionRequestService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/production/requests")
@RequiredArgsConstructor
public class ProductionRequestController {

    private final ProductionRequestService productionRequestService;

    @PostMapping
    public ResponseEntity<ProductionRequest> createRequest(@RequestBody CreateProductionRequestRequest request) {
        ProductionRequest productionRequest = productionRequestService.createRequest(
                request.getProductItemId(),
                request.getLocationId(),
                request.getRequestedBy(),
                request.getNeededBy(),
                request.getTargetQuantity(),
                request.getUnit(),
                request.getPriority() != null ? request.getPriority() : ProductionRequest.Priority.NORMAL,
                request.getReason()
        );
        return ResponseEntity.ok(productionRequest);
    }

    @GetMapping
    public ResponseEntity<List<ProductionRequest>> getRequests(
            @RequestParam(required = false) ProductionRequest.Status status,
            @RequestParam(required = false) UUID locationId) {
        
        if (status != null && locationId != null) {
            return ResponseEntity.ok(productionRequestService.getRequestsByLocationAndStatus(locationId, status));
        } else if (status != null) {
            return ResponseEntity.ok(productionRequestService.getRequestsByStatus(status));
        } else {
            // For now, return empty list if no filters specified
            // TODO: Implement getAllRequests in service
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<ProductionRequest>> getOverdueRequests() {
        return ResponseEntity.ok(productionRequestService.getOverdueRequests());
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<ProductionRequest> getRequest(@PathVariable UUID requestId) {
        return ResponseEntity.ok(productionRequestService.getRequest(requestId));
    }

    @PatchMapping("/{requestId}")
    public ResponseEntity<ProductionRequest> updateRequestStatus(
            @PathVariable UUID requestId,
            @RequestBody UpdateRequestStatusRequest request) {
        
        ProductionRequest updatedRequest = productionRequestService.updateRequestStatus(requestId, request.getStatus());
        return ResponseEntity.ok(updatedRequest);
    }

    @DeleteMapping("/{requestId}")
    public ResponseEntity<Void> deleteRequest(@PathVariable UUID requestId) {
        productionRequestService.deleteRequest(requestId);
        return ResponseEntity.noContent().build();
    }

    // Request DTOs
    @Setter
    @Getter
    public static class CreateProductionRequestRequest {
        private UUID productItemId;
        private UUID locationId;
        private UUID requestedBy;
        private LocalDateTime neededBy;
        private Double targetQuantity;
        private String unit;
        private ProductionRequest.Priority priority;
        private String reason;

    }

    @Setter
    @Getter
    public static class UpdateRequestStatusRequest {
        private ProductionRequest.Status status;

    }
}