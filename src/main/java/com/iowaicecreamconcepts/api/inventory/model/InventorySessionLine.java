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
@Table(name = "inventory_session_lines")
public class InventorySessionLine {

    @Id
    @GeneratedValue
    private UUID id;

    @NotNull
    @Column(nullable = false)
    private UUID sessionId;

    @NotNull
    @Column(nullable = false)
    private UUID itemId;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    private Double count;

    @NotBlank
    @Column(nullable = false)
    private String unit;

    private String note;

    private String photoUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}