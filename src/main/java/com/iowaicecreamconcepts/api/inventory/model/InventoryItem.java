package com.iowaicecreamconcepts.api.inventory.model;

import com.iowaicecreamconcepts.api.inventory.dto.InventoryItemRequest;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue
    private UUID id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @NotBlank
    @Column(nullable = false)
    private String unit;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    private Double parStockLevel;

    private UUID defaultLocationId;

    private String sku;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public static InventoryItem fromRequest(InventoryItemRequest request) {
        return InventoryItem.builder()
                .name(request.getName())
                .category(request.getCategory())
                .unit(request.getUnit())
                .parStockLevel(request.getParStockLevel())
                .defaultLocationId(request.getDefaultLocationId())
                .sku(request.getSku())
                .notes(request.getNotes())
                .build();
    }

    public enum Category {
        BASE,
        MIX_IN,
        PACKAGING,
        BEVERAGE
    }
}