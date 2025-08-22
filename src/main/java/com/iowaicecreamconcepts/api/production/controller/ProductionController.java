package com.iowaicecreamconcepts.api.production.controller;

import com.iowaicecreamconcepts.api.production.model.ProductionBatch;
import com.iowaicecreamconcepts.api.production.model.WasteEvent;
import com.iowaicecreamconcepts.api.production.service.ProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/production")
@RequiredArgsConstructor
public class ProductionController {

    private final ProductionService productionService;

    @PostMapping("/batches")
    public ResponseEntity<ProductionBatch> createBatch(@RequestBody CreateBatchRequest request) {
        ProductionBatch batch = productionService.createBatch(
                request.getProductItemId(),
                request.getQuantityMade(),
                request.getUnit(),
                request.getStorageLocationId(),
                request.getMadeBy(),
                request.getNotes()
        );
        return ResponseEntity.ok(batch);
    }

    @GetMapping("/batches")
    public ResponseEntity<List<ProductionBatch>> getBatches(
            @RequestParam(required = false) ProductionBatch.Status status) {
        
        if (status != null) {
            return ResponseEntity.ok(productionService.getBatchesByStatus(status));
        }
        
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/batches/{batchId}")
    public ResponseEntity<ProductionBatch> getBatch(@PathVariable UUID batchId) {
        return ResponseEntity.ok(productionService.getBatch(batchId));
    }

    @PostMapping("/batches/{batchId}/complete")
    public ResponseEntity<ProductionBatch> completeBatch(@PathVariable UUID batchId) {
        ProductionBatch batch = productionService.completeBatch(batchId);
        return ResponseEntity.ok(batch);
    }

    @PostMapping("/batches/{batchId}/runout")
    public ResponseEntity<ProductionBatch> runOutBatch(@PathVariable UUID batchId) {
        ProductionBatch batch = productionService.runOutBatch(batchId);
        return ResponseEntity.ok(batch);
    }

    @PostMapping("/batches/{batchId}/waste")
    public ResponseEntity<WasteEvent> recordWaste(
            @PathVariable UUID batchId,
            @RequestBody RecordWasteRequest request) {
        
        WasteEvent wasteEvent = productionService.recordWaste(
                batchId,
                request.getItemId(),
                request.getQuantity(),
                request.getUnit(),
                request.getReason(),
                request.getRecordedBy(),
                request.getNotes()
        );
        return ResponseEntity.ok(wasteEvent);
    }

    @PostMapping("/waste")
    public ResponseEntity<WasteEvent> recordGeneralWaste(@RequestBody RecordWasteRequest request) {
        WasteEvent wasteEvent = productionService.recordWaste(
                null, // No batch associated
                request.getItemId(),
                request.getQuantity(),
                request.getUnit(),
                request.getReason(),
                request.getRecordedBy(),
                request.getNotes()
        );
        return ResponseEntity.ok(wasteEvent);
    }

    @GetMapping("/batches/{batchId}/waste")
    public ResponseEntity<List<WasteEvent>> getBatchWaste(@PathVariable UUID batchId) {
        return ResponseEntity.ok(productionService.getWasteEventsByBatch(batchId));
    }

    @GetMapping("/waste/item/{itemId}")
    public ResponseEntity<List<WasteEvent>> getItemWaste(@PathVariable UUID itemId) {
        return ResponseEntity.ok(productionService.getWasteEventsByItem(itemId));
    }

    // Request DTOs
    public static class CreateBatchRequest {
        private UUID productItemId;
        private Double quantityMade;
        private String unit;
        private UUID storageLocationId;
        private UUID madeBy;
        private String notes;

        public UUID getProductItemId() { return productItemId; }
        public void setProductItemId(UUID productItemId) { this.productItemId = productItemId; }
        public Double getQuantityMade() { return quantityMade; }
        public void setQuantityMade(Double quantityMade) { this.quantityMade = quantityMade; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public UUID getStorageLocationId() { return storageLocationId; }
        public void setStorageLocationId(UUID storageLocationId) { this.storageLocationId = storageLocationId; }
        public UUID getMadeBy() { return madeBy; }
        public void setMadeBy(UUID madeBy) { this.madeBy = madeBy; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class RecordWasteRequest {
        private UUID itemId;
        private Double quantity;
        private String unit;
        private WasteEvent.WasteReason reason;
        private UUID recordedBy;
        private String notes;

        public UUID getItemId() { return itemId; }
        public void setItemId(UUID itemId) { this.itemId = itemId; }
        public Double getQuantity() { return quantity; }
        public void setQuantity(Double quantity) { this.quantity = quantity; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public WasteEvent.WasteReason getReason() { return reason; }
        public void setReason(WasteEvent.WasteReason reason) { this.reason = reason; }
        public UUID getRecordedBy() { return recordedBy; }
        public void setRecordedBy(UUID recordedBy) { this.recordedBy = recordedBy; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}