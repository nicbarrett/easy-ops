package com.iowaicecreamconcepts.api.inventory.service;

import com.iowaicecreamconcepts.api.inventory.model.InventoryItem;
import com.iowaicecreamconcepts.api.inventory.repository.InventoryItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryItemRepository repository;

    @InjectMocks
    private InventoryService inventoryService;

    private InventoryItem testItem;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        testItem = InventoryItem.builder()
                .id(testId)
                .name("Test Item")
                .category(InventoryItem.Category.BASE)
                .unit("gallons")
                .parStockLevel(10.0)
                .sku("TEST-001")
                .isActive(true)
                .build();
    }

    @Test
    void getAllItems_ShouldReturnActiveItems() {
        // Given
        List<InventoryItem> expectedItems = Collections.singletonList(testItem);
        when(repository.findByIsActiveTrueOrderByName()).thenReturn(expectedItems);

        // When
        List<InventoryItem> result = inventoryService.getAllItems();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getName()).isEqualTo("Test Item");
        verify(repository).findByIsActiveTrueOrderByName();
    }

    @Test
    void getItemById_WhenItemExists_ShouldReturnItem() {
        // Given
        when(repository.findById(testId)).thenReturn(Optional.of(testItem));

        // When
        Optional<InventoryItem> result = inventoryService.getItemById(testId);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Test Item");
        verify(repository).findById(testId);
    }

    @Test
    void getItemById_WhenItemNotExists_ShouldReturnEmpty() {
        // Given
        when(repository.findById(testId)).thenReturn(Optional.empty());

        // When
        Optional<InventoryItem> result = inventoryService.getItemById(testId);

        // Then
        assertThat(result).isEmpty();
        verify(repository).findById(testId);
    }

    @Test
    void createItem_WhenNameIsUnique_ShouldSaveItem() {
        // Given
        when(repository.existsByName("Test Item")).thenReturn(false);
        when(repository.save(testItem)).thenReturn(testItem);

        // When
        InventoryItem result = inventoryService.createItem(testItem);

        // Then
        assertThat(result).isEqualTo(testItem);
        verify(repository).existsByName("Test Item");
        verify(repository).save(testItem);
    }

    @Test
    void createItem_WhenNameExists_ShouldThrowException() {
        // Given
        when(repository.existsByName("Test Item")).thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> inventoryService.createItem(testItem))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Item with this name already exists");
        
        verify(repository).existsByName("Test Item");
        verify(repository, never()).save(any());
    }

    @Test
    void updateItem_WhenItemExists_ShouldUpdateItem() {
        // Given
        InventoryItem updatedItem = InventoryItem.builder()
                .name("Updated Item")
                .category(InventoryItem.Category.MIX_IN)
                .unit("pounds")
                .parStockLevel(5.0)
                .sku("UPD-001")
                .build();

        when(repository.findById(testId)).thenReturn(Optional.of(testItem));
        when(repository.save(testItem)).thenReturn(testItem);

        // When
        InventoryItem result = inventoryService.updateItem(testId, updatedItem);

        // Then
        assertThat(result.getName()).isEqualTo("Updated Item");
        assertThat(result.getCategory()).isEqualTo(InventoryItem.Category.MIX_IN);
        verify(repository).findById(testId);
        verify(repository).save(testItem);
    }

    @Test
    void updateItem_WhenItemNotExists_ShouldThrowException() {
        // Given
        InventoryItem updatedItem = InventoryItem.builder().name("Updated Item").build();
        when(repository.findById(testId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> inventoryService.updateItem(testId, updatedItem))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Item not found");
        
        verify(repository).findById(testId);
        verify(repository, never()).save(any());
    }

    @Test
    void deleteItem_WhenItemExists_ShouldSoftDeleteItem() {
        // Given
        when(repository.findById(testId)).thenReturn(Optional.of(testItem));
        when(repository.save(testItem)).thenReturn(testItem);

        // When
        inventoryService.deleteItem(testId);

        // Then
        assertThat(testItem.getIsActive()).isFalse();
        verify(repository).findById(testId);
        verify(repository).save(testItem);
    }

    @Test
    void deleteItem_WhenItemNotExists_ShouldThrowException() {
        // Given
        when(repository.findById(testId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> inventoryService.deleteItem(testId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Item not found");
        
        verify(repository).findById(testId);
        verify(repository, never()).save(any());
    }

    @Test
    void getItemsByCategory_ShouldReturnItemsOfCategory() {
        // Given
        List<InventoryItem> expectedItems = Collections.singletonList(testItem);
        when(repository.findByCategory(InventoryItem.Category.BASE)).thenReturn(expectedItems);

        // When
        List<InventoryItem> result = inventoryService.getItemsByCategory(InventoryItem.Category.BASE);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getCategory()).isEqualTo(InventoryItem.Category.BASE);
        verify(repository).findByCategory(InventoryItem.Category.BASE);
    }

    @Test
    void getItemsByLocation_ShouldReturnItemsOfLocation() {
        // Given
        UUID locationId = UUID.randomUUID();
        List<InventoryItem> expectedItems = Collections.singletonList(testItem);
        when(repository.findByDefaultLocationId(locationId)).thenReturn(expectedItems);

        // When
        List<InventoryItem> result = inventoryService.getItemsByLocation(locationId);

        // Then
        assertThat(result).hasSize(1);
        verify(repository).findByDefaultLocationId(locationId);
    }
}