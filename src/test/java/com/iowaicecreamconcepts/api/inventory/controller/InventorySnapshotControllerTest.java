package com.iowaicecreamconcepts.api.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iowaicecreamconcepts.api.inventory.dto.InventorySnapshotRequest;
import com.iowaicecreamconcepts.api.inventory.model.InventoryItem;
import com.iowaicecreamconcepts.api.inventory.model.InventorySnapshot;
import com.iowaicecreamconcepts.api.inventory.service.InventorySnapshotService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(InventorySnapshotControllerTest.MockConfig.class)
class InventorySnapshotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private InventorySnapshotService snapshotService;

    @TestConfiguration
    static class MockConfig {
        @Bean
        public InventorySnapshotService snapshotService() {
            return Mockito.mock(InventorySnapshotService.class);
        }
    }

    @BeforeEach
    void setup() {
        Mockito.reset(snapshotService);
    }

    @Test
    void testRecordSnapshot() throws Exception {
        InventoryItem item = InventoryItem.builder()
                .id(1L)
                .name("Whipping Cream")
                .unit("gallons")
                .build();

        InventorySnapshot snapshot = InventorySnapshot.builder()
                .id(10L)
                .inventoryItem(item)
                .quantity(4.5)
                .recordedAt(LocalDateTime.now())
                .recordedBy("admin")
                .build();

        InventorySnapshotRequest request = InventorySnapshotRequest.builder()
                .itemId(1L)
                .quantity(4.5)
                .recordedBy("admin")
                .build();

        Mockito.when(snapshotService.createSnapshot(eq(1L), eq(4.5), eq("admin")))
                .thenReturn(snapshot);

        mockMvc.perform(post("/api/inventory/snapshots")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.inventoryItem.name").value("Whipping Cream"))
                .andExpect(jsonPath("$.quantity").value(4.5));
    }

    @Test
    void testGetSnapshots() throws Exception {
        InventoryItem item = InventoryItem.builder()
                .id(1L)
                .name("Sugar")
                .unit("lbs")
                .build();

        InventorySnapshot snapshot1 = InventorySnapshot.builder()
                .id(101L)
                .inventoryItem(item)
                .quantity(10.0)
                .recordedAt(LocalDateTime.now().minusDays(1))
                .recordedBy("tester")
                .build();

        InventorySnapshot snapshot2 = InventorySnapshot.builder()
                .id(102L)
                .inventoryItem(item)
                .quantity(8.0)
                .recordedAt(LocalDateTime.now())
                .recordedBy("tester")
                .build();

        Mockito.when(snapshotService.getSnapshotsForItem(1L))
                .thenReturn(List.of(snapshot1, snapshot2));

        mockMvc.perform(get("/api/inventory/snapshots/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].quantity").value(10.0))
                .andExpect(jsonPath("$[1].quantity").value(8.0));
    }
}
