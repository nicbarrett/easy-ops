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
@Table(name = "waste_events")
public class WasteEvent {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID batchId;

    @NotNull
    @Column(nullable = false)
    private UUID itemId;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    private Double quantity;

    @NotBlank
    @Column(nullable = false)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WasteReason reason;

    @NotNull
    @Column(nullable = false)
    private UUID recordedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime recordedAt;

    private String notes;

    @PrePersist
    public void prePersist() {
        this.recordedAt = LocalDateTime.now();
    }

    public enum WasteReason {
        SPOILAGE,
        TEMP_EXCURSION,
        QA_FAIL,
        ACCIDENT,
        OTHER
    }
}