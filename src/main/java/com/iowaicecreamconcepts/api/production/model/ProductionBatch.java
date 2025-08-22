package com.iowaicecreamconcepts.api.production.model;

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
@Table(name = "production_batches")
public class ProductionBatch {

    @Id
    @GeneratedValue
    private UUID id;

    @NotNull
    @Column(nullable = false)
    private UUID productItemId;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    private Double quantityMade;

    @NotBlank
    @Column(nullable = false)
    private String unit;

    @NotNull
    @Column(nullable = false)
    private UUID storageLocationId;

    @NotNull
    @Column(nullable = false)
    private UUID madeBy;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime finishedAt;

    @Column(nullable = false, unique = true)
    private String lotCode;

    private String notes;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private Status status = Status.IN_PROGRESS;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.startedAt == null) {
            this.startedAt = now;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Status {
        IN_PROGRESS,
        COMPLETED,
        RUN_OUT,
        DISCARDED
    }
}
