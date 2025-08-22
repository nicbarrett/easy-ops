package com.iowaicecreamconcepts.api.inventory.model;

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
@Table(name = "inventory_sessions")
public class InventorySession {

    @Id
    @GeneratedValue
    private UUID id;

    @NotNull
    @Column(nullable = false)
    private UUID locationId;

    @NotNull
    @Column(nullable = false)
    private UUID startedBy;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private UUID closedBy;

    private LocalDateTime closedAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private Status status = Status.DRAFT;

    @PrePersist
    public void prePersist() {
        if (this.startedAt == null) {
            this.startedAt = LocalDateTime.now();
        }
    }

    public enum Status {
        DRAFT,
        CLOSED
    }
}