package com.iowaicecreamconcepts.api.production.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionBatchRequest {
    @NotBlank
    private String flavor;

    @NotNull
    private LocalDate dateNeededBy;

    private String requestedBy;
}
