package com.iowaicecreamconcepts.api.inventory.service;

import com.iowaicecreamconcepts.api.inventory.model.*;
import com.iowaicecreamconcepts.api.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventorySessionService {

    private final InventorySessionRepository sessionRepository;
    private final InventorySessionLineRepository sessionLineRepository;
    private final CurrentStockRepository currentStockRepository;

    public InventorySession createSession(UUID locationId, UUID userId) {
        InventorySession session = InventorySession.builder()
                .locationId(locationId)
                .startedBy(userId)
                .build();
        
        return sessionRepository.save(session);
    }

    public List<InventorySession> getSessionsByLocation(UUID locationId) {
        return sessionRepository.findByLocationIdOrderByStartedAtDesc(locationId);
    }

    public InventorySession getSession(UUID sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }

    public List<InventorySessionLine> getSessionLines(UUID sessionId) {
        return sessionLineRepository.findBySessionIdOrderByCreatedAt(sessionId);
    }

    public InventorySessionLine addSessionLine(UUID sessionId, UUID itemId, Double count, String unit, String note, String photoUrl) {
        // Verify session exists and is in DRAFT status
        InventorySession session = getSession(sessionId);
        if (session.getStatus() != InventorySession.Status.DRAFT) {
            throw new RuntimeException("Cannot modify closed session");
        }

        InventorySessionLine line = InventorySessionLine.builder()
                .sessionId(sessionId)
                .itemId(itemId)
                .count(count)
                .unit(unit)
                .note(note)
                .photoUrl(photoUrl)
                .build();

        return sessionLineRepository.save(line);
    }

    @Transactional
    public InventorySession closeSession(UUID sessionId, UUID userId) {
        InventorySession session = getSession(sessionId);
        
        if (session.getStatus() != InventorySession.Status.DRAFT) {
            throw new RuntimeException("Session is already closed");
        }

        List<InventorySessionLine> lines = getSessionLines(sessionId);
        if (lines.isEmpty()) {
            throw new RuntimeException("Cannot close session without any line items");
        }

        // Update session status
        session.setStatus(InventorySession.Status.CLOSED);
        session.setClosedBy(userId);
        session.setClosedAt(LocalDateTime.now());
        
        InventorySession closedSession = sessionRepository.save(session);

        // Update current stock for each line item
        updateCurrentStockFromSession(session.getLocationId(), lines);

        return closedSession;
    }

    private void updateCurrentStockFromSession(UUID locationId, List<InventorySessionLine> lines) {
        for (InventorySessionLine line : lines) {
            CurrentStock currentStock = currentStockRepository
                    .findByItemIdAndLocationId(line.getItemId(), locationId)
                    .orElse(CurrentStock.builder()
                            .itemId(line.getItemId())
                            .locationId(locationId)
                            .quantity(0.0)
                            .build());

            currentStock.setQuantity(line.getCount());
            currentStockRepository.save(currentStock);
        }
    }
}