package com.iowaicecreamconcepts.api.inventory.repository;

import com.iowaicecreamconcepts.api.inventory.model.InventorySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface InventorySnapshotRepository extends JpaRepository<InventorySnapshot, Long> {

    List<InventorySnapshot> findByInventoryItemIdOrderByRecordedAtDesc(Long inventoryItemId);

    @Query("""
        SELECT s 
        FROM InventorySnapshot s
        WHERE s.recordedAt = (
            SELECT MAX(sub.recordedAt)
            FROM InventorySnapshot sub
            WHERE sub.inventoryItem.id = s.inventoryItem.id
        )
    """)
    List<InventorySnapshot> findLatestSnapshotsForAllItems();

    @Query("""
        SELECT DISTINCT DATE_TRUNC('minute', s.recordedAt) 
        FROM InventorySnapshot s 
        ORDER BY DATE_TRUNC('minute', s.recordedAt) DESC
    """)
    List<LocalDateTime> findDistinctSnapshotTimes();

    List<InventorySnapshot> findByRecordedAtBetween(LocalDateTime start, LocalDateTime end);
}
