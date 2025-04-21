package com.iowaicecreamconcepts.api.production.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String flavor;

    private LocalDate dateRequested;
    private LocalDate dateNeededBy;

    private LocalDate dateProduced;
    private String producedBy;

    private LocalDate dateUsedUp;

    private LocalDate dateDiscarded;
    private String discardReason;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        REQUESTED,
        PRODUCED,
        DEPLETED,
        DISCARDED
    }
}
