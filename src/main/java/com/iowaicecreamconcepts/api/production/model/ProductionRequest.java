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
@Table(name = "production_requests")
public class ProductionRequest {

    @Id
    @GeneratedValue
    private UUID id;

    @NotNull
    @Column(nullable = false)
    private UUID productItemId;

    @NotNull
    @Column(nullable = false)
    private UUID locationId;

    @NotNull
    @Column(nullable = false)
    private UUID requestedBy;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime neededBy;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    private Double targetQuantity;

    @NotBlank
    @Column(nullable = false)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private Priority priority = Priority.NORMAL;

    @NotBlank
    @Column(nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private Status status = Status.OPEN;

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

    public enum Priority {
        NORMAL,
        HIGH
    }

    public enum Status {
        OPEN,
        IN_PROGRESS,
        COMPLETED,
        ARCHIVED
    }
}