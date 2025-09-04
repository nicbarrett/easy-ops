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
@Table(name = "recipe_ingredients")
public class RecipeIngredient {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @NotNull
    @Column(nullable = false)
    private UUID ingredientItemId;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Double quantity;

    @NotBlank
    @Column(nullable = false)
    private String unit;

    @PositiveOrZero
    private BigDecimal unitCost;

    @PositiveOrZero
    private BigDecimal totalCost;

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
}