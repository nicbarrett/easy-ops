package com.iowaicecreamconcepts.api.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Standard error response format for API errors")
public class ErrorResponse {
    
    @Schema(description = "Error message describing what went wrong", example = "Validation failed")
    private String error;
    
    @Schema(description = "HTTP status code", example = "400")
    private int status;
    
    @Schema(description = "Timestamp when the error occurred", example = "2025-08-25T10:30:00")
    private LocalDateTime timestamp;
    
    @Schema(description = "Request path that caused the error", example = "/api/inventory/items")
    private String path;
    
    @Schema(description = "Detailed validation errors (when applicable)")
    private List<FieldError> errors;
    
    public ErrorResponse(String error, int status, String path) {
        this.error = error;
        this.status = status;
        this.path = path;
        this.timestamp = LocalDateTime.now();
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Field-specific validation error")
    public static class FieldError {
        
        @Schema(description = "Name of the field that failed validation", example = "name")
        private String field;
        
        @Schema(description = "Error message for this field", example = "Name is required")
        private String message;
        
        @Schema(description = "The rejected value (if applicable)", example = "null")
        private Object rejectedValue;
    }
}