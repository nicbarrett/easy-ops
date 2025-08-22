package com.iowaicecreamconcepts.api.inventory.service;

import com.iowaicecreamconcepts.api.inventory.model.InventorySession;
import com.iowaicecreamconcepts.api.inventory.model.InventorySessionLine;
import com.iowaicecreamconcepts.api.inventory.model.CurrentStock;
import com.iowaicecreamconcepts.api.inventory.repository.InventorySessionRepository;
import com.iowaicecreamconcepts.api.inventory.repository.InventorySessionLineRepository;
import com.iowaicecreamconcepts.api.inventory.repository.CurrentStockRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventorySessionServiceTest {

    @Mock
    private InventorySessionRepository sessionRepository;

    @Mock
    private InventorySessionLineRepository sessionLineRepository;

    @Mock
    private CurrentStockRepository currentStockRepository;

    @InjectMocks
    private InventorySessionService inventorySessionService;

    private UUID sessionId;
    private UUID locationId;
    private UUID userId;
    private UUID itemId;
    private InventorySession testSession;

    @BeforeEach
    void setUp() {
        sessionId = UUID.randomUUID();
        locationId = UUID.randomUUID();
        userId = UUID.randomUUID();
        itemId = UUID.randomUUID();
        
        testSession = InventorySession.builder()
                .id(sessionId)
                .locationId(locationId)
                .startedBy(userId)
                .status(InventorySession.Status.DRAFT)
                .build();
    }

    @Test
    void createSession_ShouldCreateNewSession() {
        // Given
        when(sessionRepository.save(any(InventorySession.class))).thenReturn(testSession);

        // When
        InventorySession result = inventorySessionService.createSession(locationId, userId);

        // Then
        assertThat(result).isEqualTo(testSession);
        verify(sessionRepository).save(any(InventorySession.class));
    }

    @Test
    void getSessionsByLocation_ShouldReturnSessionsForLocation() {
        // Given
        List<InventorySession> expectedSessions = Arrays.asList(testSession);
        when(sessionRepository.findByLocationIdOrderByStartedAtDesc(locationId)).thenReturn(expectedSessions);

        // When
        List<InventorySession> result = inventorySessionService.getSessionsByLocation(locationId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(testSession);
        verify(sessionRepository).findByLocationIdOrderByStartedAtDesc(locationId);
    }

    @Test
    void getSession_WhenSessionExists_ShouldReturnSession() {
        // Given
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(testSession));

        // When
        InventorySession result = inventorySessionService.getSession(sessionId);

        // Then
        assertThat(result).isEqualTo(testSession);
        verify(sessionRepository).findById(sessionId);
    }

    @Test
    void getSession_WhenSessionNotExists_ShouldThrowException() {
        // Given
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> inventorySessionService.getSession(sessionId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Session not found");
    }

    @Test
    void addSessionLine_WhenSessionIsDraft_ShouldAddLine() {
        // Given
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(testSession));
        
        InventorySessionLine expectedLine = InventorySessionLine.builder()
                .sessionId(sessionId)
                .itemId(itemId)
                .count(10.0)
                .unit("gallons")
                .note("Test note")
                .build();
        
        when(sessionLineRepository.save(any(InventorySessionLine.class))).thenReturn(expectedLine);

        // When
        InventorySessionLine result = inventorySessionService.addSessionLine(
                sessionId, itemId, 10.0, "gallons", "Test note", null);

        // Then
        assertThat(result).isEqualTo(expectedLine);
        verify(sessionRepository).findById(sessionId);
        verify(sessionLineRepository).save(any(InventorySessionLine.class));
    }

    @Test
    void addSessionLine_WhenSessionIsClosed_ShouldThrowException() {
        // Given
        testSession.setStatus(InventorySession.Status.CLOSED);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(testSession));

        // When/Then
        assertThatThrownBy(() -> inventorySessionService.addSessionLine(
                sessionId, itemId, 10.0, "gallons", "Test note", null))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Cannot modify closed session");
        
        verify(sessionLineRepository, never()).save(any());
    }

    @Test
    void closeSession_WhenSessionHasLines_ShouldCloseSession() {
        // Given
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(testSession));
        
        InventorySessionLine line = InventorySessionLine.builder()
                .sessionId(sessionId)
                .itemId(itemId)
                .count(15.0)
                .unit("gallons")
                .build();
        
        when(sessionLineRepository.findBySessionIdOrderByCreatedAt(sessionId))
                .thenReturn(Arrays.asList(line));
        when(sessionRepository.save(testSession)).thenReturn(testSession);
        when(currentStockRepository.findByItemIdAndLocationId(itemId, locationId))
                .thenReturn(Optional.empty());
        when(currentStockRepository.save(any(CurrentStock.class))).thenReturn(new CurrentStock());

        // When
        InventorySession result = inventorySessionService.closeSession(sessionId, userId);

        // Then
        assertThat(result.getStatus()).isEqualTo(InventorySession.Status.CLOSED);
        assertThat(result.getClosedBy()).isEqualTo(userId);
        verify(sessionRepository).save(testSession);
        verify(currentStockRepository).save(any(CurrentStock.class));
    }

    @Test
    void closeSession_WhenSessionHasNoLines_ShouldThrowException() {
        // Given
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(testSession));
        when(sessionLineRepository.findBySessionIdOrderByCreatedAt(sessionId))
                .thenReturn(Arrays.asList());

        // When/Then
        assertThatThrownBy(() -> inventorySessionService.closeSession(sessionId, userId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Cannot close session without any line items");
        
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void closeSession_WhenSessionAlreadyClosed_ShouldThrowException() {
        // Given
        testSession.setStatus(InventorySession.Status.CLOSED);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(testSession));

        // When/Then
        assertThatThrownBy(() -> inventorySessionService.closeSession(sessionId, userId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Session is already closed");
    }
}