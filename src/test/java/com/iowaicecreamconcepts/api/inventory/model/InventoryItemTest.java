package com.iowaicecreamconcepts.api.inventory.model;

import com.iowaicecreamconcepts.api.inventory.dto.InventoryItemRequest;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

class InventoryItemTest {

    @Test
    void fromRequest_ShouldCreateInventoryItemFromRequest() {
        // Given
        UUID locationId = UUID.randomUUID();
        InventoryItemRequest request = InventoryItemRequest.builder()
                .name("Test Item")
                .category(InventoryItem.Category.BASE)
                .unit("gallons")
                .parStockLevel(10.0)
                .defaultLocationId(locationId)
                .sku("TEST-001")
                .notes("Test notes")
                .build();

        // When
        InventoryItem result = InventoryItem.fromRequest(request);

        // Then
        assertThat(result.getName()).isEqualTo("Test Item");
        assertThat(result.getCategory()).isEqualTo(InventoryItem.Category.BASE);
        assertThat(result.getUnit()).isEqualTo("gallons");
        assertThat(result.getParStockLevel()).isEqualTo(10.0);
        assertThat(result.getDefaultLocationId()).isEqualTo(locationId);
        assertThat(result.getSku()).isEqualTo("TEST-001");
        assertThat(result.getNotes()).isEqualTo("Test notes");
        assertThat(result.getIsActive()).isTrue(); // default value
    }

    @Test
    void prePersist_ShouldSetTimestamps() {
        // Given
        InventoryItem item = InventoryItem.builder()
                .name("Test Item")
                .category(InventoryItem.Category.BASE)
                .unit("gallons")
                .parStockLevel(10.0)
                .build();

        // When
        item.prePersist();

        // Then
        assertThat(item.getCreatedAt()).isNotNull();
        assertThat(item.getUpdatedAt()).isNotNull();
        assertThat(item.getCreatedAt()).isEqualTo(item.getUpdatedAt());
    }

    @Test
    void preUpdate_ShouldUpdateTimestamp() throws InterruptedException {
        // Given
        InventoryItem item = InventoryItem.builder()
                .name("Test Item")
                .category(InventoryItem.Category.BASE)
                .unit("gallons")
                .parStockLevel(10.0)
                .build();
        
        item.prePersist();
        java.time.LocalDateTime originalUpdatedAt = item.getUpdatedAt();
        
        Thread.sleep(1); // Ensure time difference

        // When
        item.preUpdate();

        // Then
        assertThat(item.getUpdatedAt()).isAfter(originalUpdatedAt);
        assertThat(item.getCreatedAt()).isEqualTo(item.getCreatedAt()); // Should not change
    }

    @Test
    void category_AllValuesAccessible() {
        // Then
        assertThat(InventoryItem.Category.values()).containsExactly(
                InventoryItem.Category.BASE,
                InventoryItem.Category.MIX_IN,
                InventoryItem.Category.PACKAGING,
                InventoryItem.Category.BEVERAGE
        );
    }
}