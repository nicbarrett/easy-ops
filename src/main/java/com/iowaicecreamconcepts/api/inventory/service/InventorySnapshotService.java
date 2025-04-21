package com.iowaicecreamconcepts.api.inventory.service;

import com.iowaicecreamconcepts.api.inventory.model.InventoryItem;
import com.iowaicecreamconcepts.api.inventory.model.InventorySnapshot;
import com.iowaicecreamconcepts.api.inventory.repository.InventoryItemRepository;
import com.iowaicecreamconcepts.api.inventory.repository.InventorySnapshotRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventorySnapshotService {

    private final InventorySnapshotRepository snapshotRepository;
    private final InventoryItemRepository itemRepository;

    public InventorySnapshotService(InventorySnapshotRepository snapshotRepository, InventoryItemRepository itemRepository) {
        this.snapshotRepository = snapshotRepository;
        this.itemRepository = itemRepository;
    }

    public InventorySnapshot createSnapshot(Long itemId, double quantity, String recordedBy) {
        InventoryItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        return snapshotRepository.save(
                InventorySnapshot.builder()
                        .inventoryItem(item)
                        .quantity(quantity)
                        .recordedBy(recordedBy)
                        .build()
        );
    }

    public List<InventorySnapshot> getSnapshotsForItem(Long itemId) {
        return snapshotRepository.findByInventoryItemIdOrderByRecordedAtDesc(itemId);
    }

    public List<InventorySnapshot> getSnapshots() {
        return snapshotRepository.findAll();
    }

    public List<InventorySnapshot> getCurrentInventory() {
        return snapshotRepository.findLatestSnapshotsForAllItems();
    }

    public List<LocalDateTime> getSnapshotSessionTimes() {
        return snapshotRepository.findDistinctSnapshotTimes();
    }

    public List<InventorySnapshot> getSnapshotsByTimestamp(LocalDateTime timestamp) {
        return snapshotRepository.findByRecordedAtBetween(
                timestamp,
                timestamp.plusMinutes(1)  // match full minute group
        );
    }


}
