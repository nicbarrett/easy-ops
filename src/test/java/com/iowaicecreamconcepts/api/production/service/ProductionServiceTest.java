package com.iowaicecreamconcepts.api.production.service;

import com.iowaicecreamconcepts.api.inventory.model.CurrentStock;
import com.iowaicecreamconcepts.api.inventory.repository.CurrentStockRepository;
import com.iowaicecreamconcepts.api.production.model.ProductionBatch;
import com.iowaicecreamconcepts.api.production.model.WasteEvent;
import com.iowaicecreamconcepts.api.production.repository.ProductionBatchRepository;
import com.iowaicecreamconcepts.api.production.repository.WasteEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductionServiceTest {

    @Mock
    private ProductionBatchRepository batchRepository;

    @Mock
    private WasteEventRepository wasteEventRepository;

    @Mock
    private CurrentStockRepository currentStockRepository;

    @InjectMocks
    private ProductionService productionService;

    private UUID batchId;
    private UUID productItemId;
    private UUID storageLocationId;
    private UUID madeBy;
    private ProductionBatch testBatch;

    @BeforeEach
    void setUp() {
        batchId = UUID.randomUUID();
        productItemId = UUID.randomUUID();
        storageLocationId = UUID.randomUUID();
        madeBy = UUID.randomUUID();
        
        testBatch = ProductionBatch.builder()
                .id(batchId)
                .productItemId(productItemId)
                .quantityMade(10.0)
                .unit("gallons")
                .storageLocationId(storageLocationId)
                .madeBy(madeBy)
                .lotCode("20250822-001")
                .status(ProductionBatch.Status.IN_PROGRESS)
                .build();
    }

    @Test
    void createBatch_ShouldCreateBatchAndUpdateStock() {
        // Given
        when(batchRepository.countByLotCodeStartingWith(anyString())).thenReturn(0L);
        when(batchRepository.save(any(ProductionBatch.class))).thenReturn(testBatch);
        when(currentStockRepository.findByItemIdAndLocationId(productItemId, storageLocationId))
                .thenReturn(Optional.empty());
        when(currentStockRepository.save(any(CurrentStock.class))).thenReturn(new CurrentStock());

        // When
        ProductionBatch result = productionService.createBatch(
                productItemId, 10.0, "gallons", storageLocationId, madeBy, "Test batch");

        // Then
        assertThat(result).isEqualTo(testBatch);
        verify(batchRepository).save(any(ProductionBatch.class));
        verify(currentStockRepository).save(any(CurrentStock.class));
    }

    @Test
    void completeBatch_WhenBatchInProgress_ShouldCompleteBatch() {
        // Given
        when(batchRepository.findById(batchId)).thenReturn(Optional.of(testBatch));
        when(batchRepository.save(testBatch)).thenReturn(testBatch);

        // When
        ProductionBatch result = productionService.completeBatch(batchId);

        // Then
        assertThat(result.getStatus()).isEqualTo(ProductionBatch.Status.COMPLETED);
        assertThat(result.getFinishedAt()).isNotNull();
        verify(batchRepository).findById(batchId);
        verify(batchRepository).save(testBatch);
    }

    @Test
    void completeBatch_WhenBatchNotInProgress_ShouldThrowException() {
        // Given
        testBatch.setStatus(ProductionBatch.Status.COMPLETED);
        when(batchRepository.findById(batchId)).thenReturn(Optional.of(testBatch));

        // When/Then
        assertThatThrownBy(() -> productionService.completeBatch(batchId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Can only complete batches that are in progress");
        
        verify(batchRepository, never()).save(any());
    }

    @Test
    void runOutBatch_WhenBatchCompleted_ShouldRunOutBatch() {
        // Given
        testBatch.setStatus(ProductionBatch.Status.COMPLETED);
        when(batchRepository.findById(batchId)).thenReturn(Optional.of(testBatch));
        when(batchRepository.save(testBatch)).thenReturn(testBatch);
        when(currentStockRepository.findByItemIdAndLocationId(productItemId, storageLocationId))
                .thenReturn(Optional.of(CurrentStock.builder()
                        .itemId(productItemId)
                        .locationId(storageLocationId)
                        .quantity(10.0)
                        .build()));
        when(currentStockRepository.save(any(CurrentStock.class))).thenReturn(new CurrentStock());

        // When
        ProductionBatch result = productionService.runOutBatch(batchId);

        // Then
        assertThat(result.getStatus()).isEqualTo(ProductionBatch.Status.RUN_OUT);
        verify(batchRepository).save(testBatch);
        verify(currentStockRepository).save(any(CurrentStock.class));
    }

    @Test
    void runOutBatch_WhenBatchNotCompleted_ShouldThrowException() {
        // Given
        when(batchRepository.findById(batchId)).thenReturn(Optional.of(testBatch));

        // When/Then
        assertThatThrownBy(() -> productionService.runOutBatch(batchId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Can only run out completed batches");
    }

    @Test
    void recordWaste_WithBatch_ShouldRecordWasteAndUpdateStock() {
        // Given
        testBatch.setStatus(ProductionBatch.Status.COMPLETED);
        when(batchRepository.findById(batchId)).thenReturn(Optional.of(testBatch));
        
        WasteEvent expectedWaste = WasteEvent.builder()
                .batchId(batchId)
                .itemId(productItemId)
                .quantity(2.0)
                .unit("gallons")
                .reason(WasteEvent.WasteReason.SPOILAGE)
                .recordedBy(madeBy)
                .build();
        
        when(wasteEventRepository.save(any(WasteEvent.class))).thenReturn(expectedWaste);
        when(currentStockRepository.findByItemIdAndLocationId(productItemId, storageLocationId))
                .thenReturn(Optional.of(CurrentStock.builder()
                        .itemId(productItemId)
                        .locationId(storageLocationId)
                        .quantity(10.0)
                        .build()));
        when(currentStockRepository.save(any(CurrentStock.class))).thenReturn(new CurrentStock());

        // When
        WasteEvent result = productionService.recordWaste(
                batchId, productItemId, 2.0, "gallons", WasteEvent.WasteReason.SPOILAGE, madeBy, "Spoiled batch");

        // Then
        assertThat(result).isEqualTo(expectedWaste);
        verify(wasteEventRepository).save(any(WasteEvent.class));
        verify(currentStockRepository).save(any(CurrentStock.class));
    }

    @Test
    void recordWaste_WithRunOutBatch_ShouldThrowException() {
        // Given
        testBatch.setStatus(ProductionBatch.Status.RUN_OUT);
        when(batchRepository.findById(batchId)).thenReturn(Optional.of(testBatch));

        // When/Then
        assertThatThrownBy(() -> productionService.recordWaste(
                batchId, productItemId, 2.0, "gallons", WasteEvent.WasteReason.SPOILAGE, madeBy, "Spoiled batch"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Cannot record waste for run out batch");
    }

    @Test
    void getBatch_WhenBatchExists_ShouldReturnBatch() {
        // Given
        when(batchRepository.findById(batchId)).thenReturn(Optional.of(testBatch));

        // When
        ProductionBatch result = productionService.getBatch(batchId);

        // Then
        assertThat(result).isEqualTo(testBatch);
        verify(batchRepository).findById(batchId);
    }

    @Test
    void getBatch_WhenBatchNotExists_ShouldThrowException() {
        // Given
        when(batchRepository.findById(batchId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> productionService.getBatch(batchId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Production batch not found");
    }

    @Test
    void getBatchesByStatus_ShouldReturnBatchesWithStatus() {
        // Given
        List<ProductionBatch> expectedBatches = Collections.singletonList(testBatch);
        when(batchRepository.findByStatusOrderByCreatedAtDesc(ProductionBatch.Status.IN_PROGRESS))
                .thenReturn(expectedBatches);

        // When
        List<ProductionBatch> result = productionService.getBatchesByStatus(ProductionBatch.Status.IN_PROGRESS);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getStatus()).isEqualTo(ProductionBatch.Status.IN_PROGRESS);
        verify(batchRepository).findByStatusOrderByCreatedAtDesc(ProductionBatch.Status.IN_PROGRESS);
    }

    @Test
    void getWasteEventsByBatch_ShouldReturnWasteEvents() {
        // Given
        WasteEvent wasteEvent = WasteEvent.builder()
                .batchId(batchId)
                .quantity(2.0)
                .reason(WasteEvent.WasteReason.SPOILAGE)
                .build();
        
        List<WasteEvent> expectedEvents = Collections.singletonList(wasteEvent);
        when(wasteEventRepository.findByBatchIdOrderByRecordedAtDesc(batchId)).thenReturn(expectedEvents);

        // When
        List<WasteEvent> result = productionService.getWasteEventsByBatch(batchId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getBatchId()).isEqualTo(batchId);
        verify(wasteEventRepository).findByBatchIdOrderByRecordedAtDesc(batchId);
    }

    @Test
    void getWasteEventsByItem_ShouldReturnWasteEvents() {
        // Given
        WasteEvent wasteEvent = WasteEvent.builder()
                .itemId(productItemId)
                .quantity(2.0)
                .reason(WasteEvent.WasteReason.SPOILAGE)
                .build();
        
        List<WasteEvent> expectedEvents = Collections.singletonList(wasteEvent);
        when(wasteEventRepository.findByItemIdOrderByRecordedAtDesc(productItemId)).thenReturn(expectedEvents);

        // When
        List<WasteEvent> result = productionService.getWasteEventsByItem(productItemId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getItemId()).isEqualTo(productItemId);
        verify(wasteEventRepository).findByItemIdOrderByRecordedAtDesc(productItemId);
    }
}