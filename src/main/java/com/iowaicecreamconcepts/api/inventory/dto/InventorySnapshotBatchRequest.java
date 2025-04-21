package com.iowaicecreamconcepts.api.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventorySnapshotBatchRequest {
    @NotEmpty
    @Valid
    private List<InventorySnapshotRequest> snapshots;
}
