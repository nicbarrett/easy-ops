package com.iowaicecreamconcepts.api.production.repository;

import com.iowaicecreamconcepts.api.production.model.WasteEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface WasteEventRepository extends JpaRepository<WasteEvent, UUID> {
    
    List<WasteEvent> findByBatchIdOrderByRecordedAtDesc(UUID batchId);
    
    List<WasteEvent> findByItemIdOrderByRecordedAtDesc(UUID itemId);
    
    List<WasteEvent> findByReasonOrderByRecordedAtDesc(WasteEvent.WasteReason reason);
    
    @Query("SELECT we FROM WasteEvent we WHERE we.recordedAt BETWEEN :startDate AND :endDate ORDER BY we.recordedAt DESC")
    List<WasteEvent> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}