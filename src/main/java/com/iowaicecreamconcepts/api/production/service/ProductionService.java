package com.iowaicecreamconcepts.api.production.service;

import com.iowaicecreamconcepts.api.inventory.model.CurrentStock;
import com.iowaicecreamconcepts.api.inventory.repository.CurrentStockRepository;
import com.iowaicecreamconcepts.api.production.model.ProductionBatch;
import com.iowaicecreamconcepts.api.production.model.WasteEvent;
import com.iowaicecreamconcepts.api.production.repository.ProductionBatchRepository;
import com.iowaicecreamconcepts.api.production.repository.WasteEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductionService {

    private final ProductionBatchRepository batchRepository;
    private final WasteEventRepository wasteEventRepository;
    private final CurrentStockRepository currentStockRepository;

    @Transactional
    public ProductionBatch createBatch(UUID productItemId, Double quantityMade, String unit,
                                     UUID storageLocationId, UUID madeBy, String notes) {
        
        String lotCode = generateLotCode();
        
        ProductionBatch batch = ProductionBatch.builder()
                .productItemId(productItemId)
                .quantityMade(quantityMade)
                .unit(unit)
                .storageLocationId(storageLocationId)
                .madeBy(madeBy)
                .lotCode(lotCode)
                .notes(notes)
                .build();

        ProductionBatch savedBatch = batchRepository.save(batch);

        // Update current stock
        updateCurrentStock(productItemId, storageLocationId, quantityMade);

        return savedBatch;
    }

    @Transactional
    public ProductionBatch completeBatch(UUID batchId) {
        ProductionBatch batch = getBatch(batchId);
        
        if (batch.getStatus() != ProductionBatch.Status.IN_PROGRESS) {
            throw new RuntimeException("Can only complete batches that are in progress");
        }

        batch.setStatus(ProductionBatch.Status.COMPLETED);
        batch.setFinishedAt(LocalDateTime.now());
        
        return batchRepository.save(batch);
    }

    @Transactional
    public ProductionBatch runOutBatch(UUID batchId) {
        ProductionBatch batch = getBatch(batchId);
        
        if (batch.getStatus() != ProductionBatch.Status.COMPLETED) {
            throw new RuntimeException("Can only run out completed batches");
        }

        batch.setStatus(ProductionBatch.Status.RUN_OUT);

        // Decrease current stock
        updateCurrentStock(batch.getProductItemId(), batch.getStorageLocationId(), -batch.getQuantityMade());

        return batchRepository.save(batch);
    }

    @Transactional
    public WasteEvent recordWaste(UUID batchId, UUID itemId, Double quantity, String unit,
                                WasteEvent.WasteReason reason, UUID recordedBy, String notes) {
        
        if (batchId != null) {
            ProductionBatch batch = getBatch(batchId);
            if (batch.getStatus() == ProductionBatch.Status.RUN_OUT) {
                throw new RuntimeException("Cannot record waste for run out batch");
            }
        }

        WasteEvent wasteEvent = WasteEvent.builder()
                .batchId(batchId)
                .itemId(itemId)
                .quantity(quantity)
                .unit(unit)
                .reason(reason)
                .recordedBy(recordedBy)
                .notes(notes)
                .build();

        WasteEvent savedWasteEvent = wasteEventRepository.save(wasteEvent);

        // Update current stock by decreasing it
        if (batchId != null) {
            ProductionBatch batch = getBatch(batchId);
            updateCurrentStock(itemId, batch.getStorageLocationId(), -quantity);
        }

        return savedWasteEvent;
    }

    public ProductionBatch getBatch(UUID batchId) {
        return batchRepository.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Production batch not found"));
    }

    public List<ProductionBatch> getBatchesByStatus(ProductionBatch.Status status) {
        return batchRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public List<WasteEvent> getWasteEventsByBatch(UUID batchId) {
        return wasteEventRepository.findByBatchIdOrderByRecordedAtDesc(batchId);
    }

    public List<WasteEvent> getWasteEventsByItem(UUID itemId) {
        return wasteEventRepository.findByItemIdOrderByRecordedAtDesc(itemId);
    }

    private String generateLotCode() {
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = batchRepository.countByLotCodeStartingWith(datePrefix);
        return String.format("%s-%03d", datePrefix, count + 1);
    }

    private void updateCurrentStock(UUID itemId, UUID locationId, Double quantityChange) {
        CurrentStock currentStock = currentStockRepository
                .findByItemIdAndLocationId(itemId, locationId)
                .orElse(CurrentStock.builder()
                        .itemId(itemId)
                        .locationId(locationId)
                        .quantity(0.0)
                        .build());

        currentStock.setQuantity(currentStock.getQuantity() + quantityChange);
        currentStockRepository.save(currentStock);
    }
}