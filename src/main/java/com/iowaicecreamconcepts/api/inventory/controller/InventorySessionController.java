package com.iowaicecreamconcepts.api.inventory.controller;

import com.iowaicecreamconcepts.api.inventory.model.*;
import com.iowaicecreamconcepts.api.inventory.service.InventorySessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory/sessions")
@RequiredArgsConstructor
public class InventorySessionController {

    private final InventorySessionService inventorySessionService;

    @PostMapping
    public ResponseEntity<InventorySession> createSession(@RequestBody CreateSessionRequest request) {
        InventorySession session = inventorySessionService.createSession(
                request.getLocationId(), 
                request.getStartedBy()
        );
        return ResponseEntity.ok(session);
    }

    @GetMapping
    public ResponseEntity<List<InventorySession>> getSessions(@RequestParam(required = false) UUID locationId) {
        if (locationId != null) {
            return ResponseEntity.ok(inventorySessionService.getSessionsByLocation(locationId));
        }
        // Could add logic for getting all sessions if needed
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<InventorySession> getSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(inventorySessionService.getSession(sessionId));
    }

    @GetMapping("/{sessionId}/lines")
    public ResponseEntity<List<InventorySessionLine>> getSessionLines(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(inventorySessionService.getSessionLines(sessionId));
    }

    @PostMapping("/{sessionId}/lines")
    public ResponseEntity<InventorySessionLine> addSessionLine(
            @PathVariable UUID sessionId,
            @RequestBody AddSessionLineRequest request) {
        
        InventorySessionLine line = inventorySessionService.addSessionLine(
                sessionId,
                request.getItemId(),
                request.getCount(),
                request.getUnit(),
                request.getNote(),
                request.getPhotoUrl()
        );
        return ResponseEntity.ok(line);
    }

    @PostMapping("/{sessionId}/close")
    public ResponseEntity<InventorySession> closeSession(
            @PathVariable UUID sessionId,
            @RequestBody CloseSessionRequest request) {
        
        InventorySession session = inventorySessionService.closeSession(sessionId, request.getClosedBy());
        return ResponseEntity.ok(session);
    }

    // Request DTOs
    public static class CreateSessionRequest {
        private UUID locationId;
        private UUID startedBy;
        
        public UUID getLocationId() { return locationId; }
        public void setLocationId(UUID locationId) { this.locationId = locationId; }
        public UUID getStartedBy() { return startedBy; }
        public void setStartedBy(UUID startedBy) { this.startedBy = startedBy; }
    }

    public static class AddSessionLineRequest {
        private UUID itemId;
        private Double count;
        private String unit;
        private String note;
        private String photoUrl;

        public UUID getItemId() { return itemId; }
        public void setItemId(UUID itemId) { this.itemId = itemId; }
        public Double getCount() { return count; }
        public void setCount(Double count) { this.count = count; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    }

    public static class CloseSessionRequest {
        private UUID closedBy;
        
        public UUID getClosedBy() { return closedBy; }
        public void setClosedBy(UUID closedBy) { this.closedBy = closedBy; }
    }
}