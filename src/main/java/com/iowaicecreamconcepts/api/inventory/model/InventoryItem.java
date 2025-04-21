package com.iowaicecreamconcepts.api.inventory.model;

import com.iowaicecreamconcepts.api.inventory.dto.InventoryItemRequest;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        this.lastUpdated = LocalDateTime.now();
    }

    public static InventoryItem fromRequest(InventoryItemRequest request) {
        return InventoryItem.builder()
                .name(request.getName())
                .location(request.getLocation())
                .unit(request.getUnit())
                .minStockLevel(request.getMinStockLevel())
                .parStockLevel(request.getParStockLevel())
                .supplier(request.getSupplier())
                .build();
    }
}