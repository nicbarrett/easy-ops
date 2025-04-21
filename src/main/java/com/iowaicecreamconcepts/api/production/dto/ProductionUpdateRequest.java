package com.iowaicecreamconcepts.api.production.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionUpdateRequest {

    @NotBlank
    private String producedBy;

    @NotBlank
    private LocalDate dateProduced;
}
