package com.iowaicecreamconcepts.api.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventorySnapshotRequest {

    @NotNull
    private Long itemId;

    @NotNull
    @PositiveOrZero
    private Double quantity;

    private String recordedBy;
}
