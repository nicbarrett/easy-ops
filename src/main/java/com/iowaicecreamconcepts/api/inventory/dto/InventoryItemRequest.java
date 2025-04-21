package com.iowaicecreamconcepts.api.inventory.dto;

import jakarta.validation.constraints.*;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String location;

    @NotBlank
    private String unit;

    @NotNull
    @PositiveOrZero
    private Double minStockLevel;

    @NotNull
    @PositiveOrZero
    private Double parStockLevel;

    private String supplier;
}