package com.iowaicecreamconcepts.api.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iowaicecreamconcepts.api.inventory.dto.InventoryItemRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

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
    void shouldCreateAndFetchInventoryItem() throws Exception {
        // Build inventory item
        InventoryItemRequest itemRequest = InventoryItemRequest.builder()
                .name("Whipped Cream")
                .unit("can")
                .minStockLevel(1.0)
                .parStockLevel(2.0)
                .supplier("Dairy Best")
                .location("Fridge - Left")
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
        Long id = Long.valueOf(result.get("id").toString());

        // GET by ID
        mockMvc.perform(get("/api/inventory/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Whipped Cream"));
    }

    @Test
    void shouldReturnNotFoundForMissingItem() throws Exception {
        mockMvc.perform(get("/api/inventory/9999"))
                .andExpect(status().isNotFound());
    }
}