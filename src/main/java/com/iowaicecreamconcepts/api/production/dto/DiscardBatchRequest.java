package com.iowaicecreamconcepts.api.production.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscardBatchRequest {

    @NotBlank
    private String reason;

    @NotBlank
    private LocalDate dateDiscarded;
}
