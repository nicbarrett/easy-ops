package com.iowaicecreamconcepts.api.production.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "production_items")
public class ProductionItem {

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

    @PositiveOrZero
    private Double restockLevel;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    @PositiveOrZero
    private BigDecimal productionCost;

    @PositiveOrZero
    private BigDecimal sellingPrice;

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

    public enum Category {
        ICE_CREAM,
        BAKED_GOODS,
        PREPARED_ITEMS,
        BEVERAGES,
        SPECIALTY_ITEMS
    }
}