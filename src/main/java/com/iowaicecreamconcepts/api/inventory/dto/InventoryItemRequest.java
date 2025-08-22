package com.iowaicecreamconcepts.api.inventory.dto;

import com.iowaicecreamconcepts.api.inventory.model.InventoryItem;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemRequest {

    @NotBlank
    private String name;

    @NotNull
    private InventoryItem.Category category;

    @NotBlank
    private String unit;

    @NotNull
    @PositiveOrZero
    private Double parStockLevel;

    private UUID defaultLocationId;

    private String sku;

    private String notes;
}