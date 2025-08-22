package com.iowaicecreamconcepts.api.inventory.repository;

import com.iowaicecreamconcepts.api.inventory.model.InventoryItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class InventoryItemRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    private InventoryItem testItem1;
    private InventoryItem testItem2;
    private InventoryItem inactiveItem;
    private UUID locationId;

    @BeforeEach
    void setUp() {
        locationId = UUID.randomUUID();
        
        testItem1 = InventoryItem.builder()
                .name("Vanilla Base")
                .category(InventoryItem.Category.BASE)
                .unit("gallons")
                .parStockLevel(10.0)
                .defaultLocationId(locationId)
                .sku("VAN-001")
                .isActive(true)
                .build();

        testItem2 = InventoryItem.builder()
                .name("Chocolate Chips")
                .category(InventoryItem.Category.MIX_IN)
                .unit("pounds")
                .parStockLevel(5.0)
                .defaultLocationId(locationId)
                .sku("CHOC-001")
                .isActive(true)
                .build();

        inactiveItem = InventoryItem.builder()
                .name("Discontinued Item")
                .category(InventoryItem.Category.BASE)
                .unit("gallons")
                .parStockLevel(0.0)
                .isActive(false)
                .build();

        entityManager.persistAndFlush(testItem1);
        entityManager.persistAndFlush(testItem2);
        entityManager.persistAndFlush(inactiveItem);
    }

    @Test
    void findByNameContainingIgnoreCase_ShouldReturnMatchingItems() {
        // When
        List<InventoryItem> result = inventoryItemRepository.findByNameContainingIgnoreCase("vanilla");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Vanilla Base");
    }

    @Test
    void findByNameContainingIgnoreCase_WithPartialMatch_ShouldReturnMatchingItems() {
        // When
        List<InventoryItem> result = inventoryItemRepository.findByNameContainingIgnoreCase("choc");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Chocolate Chips");
    }

    @Test
    void findByCategory_ShouldReturnItemsOfCategory() {
        // When
        List<InventoryItem> result = inventoryItemRepository.findByCategory(InventoryItem.Category.BASE);

        // Then
        assertThat(result).hasSize(2); // testItem1 and inactiveItem
        assertThat(result).extracting(InventoryItem::getCategory)
                .containsOnly(InventoryItem.Category.BASE);
    }

    @Test
    void findByIsActiveTrueOrderByName_ShouldReturnOnlyActiveItems() {
        // When
        List<InventoryItem> result = inventoryItemRepository.findByIsActiveTrueOrderByName();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(InventoryItem::getIsActive).containsOnly(true);
        assertThat(result).extracting(InventoryItem::getName)
                .containsExactly("Chocolate Chips", "Vanilla Base"); // Ordered by name
    }

    @Test
    void findByDefaultLocationId_ShouldReturnItemsForLocation() {
        // When
        List<InventoryItem> result = inventoryItemRepository.findByDefaultLocationId(locationId);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(InventoryItem::getDefaultLocationId)
                .containsOnly(locationId);
    }

    @Test
    void existsByName_WhenNameExists_ShouldReturnTrue() {
        // When
        boolean result = inventoryItemRepository.existsByName("Vanilla Base");

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void existsByName_WhenNameNotExists_ShouldReturnFalse() {
        // When
        boolean result = inventoryItemRepository.existsByName("Non-existent Item");

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void existsByName_WithDifferentCase_ShouldReturnTrue() {
        // When
        boolean result = inventoryItemRepository.existsByName("VANILLA BASE");

        // Then
        assertThat(result).isFalse(); // Repository method is case-sensitive
    }
}