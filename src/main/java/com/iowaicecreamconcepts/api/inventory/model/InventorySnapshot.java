package com.iowaicecreamconcepts.api.inventory.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventorySnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "inventory_item_id")
    private InventoryItem inventoryItem;

    private Double quantity;

    private LocalDateTime recordedAt;

    // Optionally: who recorded it
    private String recordedBy;

    @PrePersist
    public void prePersist() {
        this.recordedAt = LocalDateTime.now();
    }
}
