package com.iowaicecreamconcepts.api.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iowaicecreamconcepts.api.inventory.dto.InventoryItemRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test") // use application-test.properties with H2
public class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldCreateAndFetchInventoryItem() throws Exception {
        // Build inventory item
        InventoryItemRequest itemRequest = InventoryItemRequest.builder()
                .name("Whipped Cream")
                .unit("can")
                .category(com.iowaicecreamconcepts.api.inventory.model.InventoryItem.Category.MIX_IN)
                .parStockLevel(2.0)
                .sku("WC-001")
                .notes("Whipped cream for desserts")
                .build();

        // POST to create item
        String jsonRequest = objectMapper.writeValueAsString(itemRequest);
        String response = mockMvc.perform(post("/api/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Extract the ID
        Map<String, Object> result = objectMapper.readValue(response, Map.class);
        String id = result.get("id").toString();

        // GET by ID
        mockMvc.perform(get("/api/inventory/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Whipped Cream"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnNotFoundForMissingItem() throws Exception {
        UUID randomId = UUID.randomUUID();
        mockMvc.perform(get("/api/inventory/" + randomId))
                .andExpect(status().isNotFound());
    }
}