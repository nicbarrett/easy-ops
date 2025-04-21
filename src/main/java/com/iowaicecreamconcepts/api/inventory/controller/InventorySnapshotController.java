package com.iowaicecreamconcepts.api.inventory.controller;

import com.iowaicecreamconcepts.api.inventory.dto.InventorySnapshotBatchRequest;
import com.iowaicecreamconcepts.api.inventory.dto.InventorySnapshotRequest;
import com.iowaicecreamconcepts.api.inventory.model.InventorySnapshot;
import com.iowaicecreamconcepts.api.inventory.service.InventorySnapshotService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/inventory/snapshots")
@CrossOrigin
public class InventorySnapshotController {

    private final InventorySnapshotService snapshotService;

    public InventorySnapshotController(InventorySnapshotService snapshotService) {
        this.snapshotService = snapshotService;
    }

    @PostMapping
    public ResponseEntity<InventorySnapshot> recordSnapshot(@Valid @RequestBody InventorySnapshotRequest request) {
        String recorder = request.getRecordedBy() != null ? request.getRecordedBy() : "system";
        return ResponseEntity.ok(
                snapshotService.createSnapshot(request.getItemId(), request.getQuantity(), recorder)
        );
    }

    @GetMapping("/{itemId}")
    public List<InventorySnapshot> getSnapshots(@PathVariable @NotNull Long itemId) {
        return snapshotService.getSnapshotsForItem(itemId);
    }

    @GetMapping
    public List<InventorySnapshot> getSnapshots() {
        return snapshotService.getSnapshots();
    }

    @GetMapping("/current")
    public List<InventorySnapshot> getCurrentInventory() {
        return snapshotService.getCurrentInventory();
    }

    @PostMapping("/batch")
    public ResponseEntity<List<InventorySnapshot>> recordSnapshotBatch(
            @Valid @RequestBody InventorySnapshotBatchRequest request) {

        List<InventorySnapshot> result = request.getSnapshots().stream()
                .map(r -> snapshotService.createSnapshot(
                        r.getItemId(),
                        r.getQuantity(),
                        r.getRecordedBy() != null ? r.getRecordedBy() : "system"
                ))
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/sessions")
    public List<LocalDateTime> getSnapshotSessionTimes() {
        return snapshotService.getSnapshotSessionTimes();
    }

    @GetMapping("/session")
    public List<InventorySnapshot> getSnapshotsBySession(@RequestParam("recordedAt") String timestamp) {
        LocalDateTime recordedAt = LocalDateTime.parse(timestamp);
        return snapshotService.getSnapshotsByTimestamp(recordedAt);
    }

}
