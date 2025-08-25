package com.iowaicecreamconcepts.api.production.controller;

import com.iowaicecreamconcepts.api.production.model.ProductionBatch;
import com.iowaicecreamconcepts.api.production.model.WasteEvent;
import com.iowaicecreamconcepts.api.production.service.ProductionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/production")
@RequiredArgsConstructor
@Tag(name = "Production", description = "Endpoints for managing production batches, waste tracking, and production workflow operations.")
public class ProductionController {

    private final ProductionService productionService;

    @PostMapping("/batches")
    @Operation(
        summary = "Create production batch",
        description = "Record a new production batch when items are produced. Updates inventory stock levels automatically.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Production batch details",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = CreateBatchRequest.class),
                examples = @ExampleObject(
                    name = "vanilla-batch",
                    summary = "Vanilla ice cream batch",
                    value = "{\"productItemId\": \"550e8400-e29b-41d4-a716-446655440000\", \"quantityMade\": 5.0, \"unit\": \"gallons\", \"storageLocationId\": \"550e8400-e29b-41d4-a716-446655440001\", \"madeBy\": \"550e8400-e29b-41d4-a716-446655440002\", \"notes\": \"Premium batch with Madagascar vanilla\"}"
                )
            )
        )
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Production batch created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ProductionBatch.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid batch data or quantity",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "invalid-quantity",
                    summary = "Invalid quantity",
                    value = "{\"error\": \"Quantity must be greater than 0\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required. JWT token missing or invalid.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "unauthorized",
                    summary = "Authentication failed",
                    value = "{\"error\": \"Authentication required\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions. PRODUCTION_LEAD or higher role required.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "forbidden",
                    summary = "Insufficient permissions",
                    value = "{\"error\": \"PRODUCTION_LEAD role required to create batches\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Referenced product item or storage location not found",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "not-found",
                    summary = "Product not found",
                    value = "{\"error\": \"Product item not found\"}"
                )
            )
        )
    })
    public ResponseEntity<ProductionBatch> createBatch(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Production batch to create")
        @Valid @RequestBody CreateBatchRequest request) {
        ProductionBatch batch = productionService.createBatch(
                request.getProductItemId(),
                request.getQuantityMade(),
                request.getUnit(),
                request.getStorageLocationId(),
                request.getMadeBy(),
                request.getNotes()
        );
        return ResponseEntity.ok(batch);
    }

    @PostMapping("/batches/{batchId}/complete")
    @Operation(
        summary = "Complete production batch",
        description = "Mark a production batch as completed, making it available for consumption."
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Batch completed successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ProductionBatch.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid batch state transition",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "invalid-state",
                    summary = "Batch already completed",
                    value = "{\"error\": \"Batch is already completed\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required. JWT token missing or invalid."
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions. PRODUCTION_LEAD or higher role required."
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Production batch not found",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "not-found",
                    summary = "Batch not found",
                    value = "{\"error\": \"Production batch not found\"}"
                )
            )
        )
    })
    public ResponseEntity<ProductionBatch> completeBatch(
        @Parameter(description = "Production batch unique identifier", example = "550e8400-e29b-41d4-a716-446655440000")
        @PathVariable UUID batchId) {
        ProductionBatch batch = productionService.completeBatch(batchId);
        return ResponseEntity.ok(batch);
    }

    @PostMapping("/batches/{batchId}/runout")
    @Operation(
        summary = "Mark batch as run out",
        description = "Mark a production batch as completely consumed/depleted. Updates inventory levels accordingly."
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Batch marked as run out successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ProductionBatch.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid batch state for run out operation",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "invalid-state",
                    summary = "Batch not completed",
                    value = "{\"error\": \"Cannot run out batch that is not completed\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required. JWT token missing or invalid."
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions. SHIFT_LEAD or higher role required."
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Production batch not found"
        )
    })
    public ResponseEntity<ProductionBatch> runOutBatch(
        @Parameter(description = "Production batch unique identifier", example = "550e8400-e29b-41d4-a716-446655440000")
        @PathVariable UUID batchId) {
        ProductionBatch batch = productionService.runOutBatch(batchId);
        return ResponseEntity.ok(batch);
    }

    @PostMapping("/batches/{batchId}/waste")
    @Operation(
        summary = "Record batch waste",
        description = "Record waste from a specific production batch with reason and quantity. Updates inventory levels automatically.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Waste event details",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = RecordWasteRequest.class),
                examples = @ExampleObject(
                    name = "spoilage-waste",
                    summary = "Spoilage waste event",
                    value = "{\"itemId\": \"550e8400-e29b-41d4-a716-446655440000\", \"quantity\": 1.5, \"unit\": \"gallons\", \"reason\": \"SPOILAGE\", \"recordedBy\": \"550e8400-e29b-41d4-a716-446655440002\", \"notes\": \"Temperature excursion during overnight storage\"}"
                )
            )
        )
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Waste event recorded successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = WasteEvent.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid waste data or quantity exceeds available batch quantity",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "exceeds-quantity",
                    summary = "Waste exceeds batch quantity",
                    value = "{\"error\": \"Waste quantity cannot exceed remaining batch quantity\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required. JWT token missing or invalid."
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions. SHIFT_LEAD or higher role required."
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Production batch or item not found"
        )
    })
    public ResponseEntity<WasteEvent> recordWaste(
            @Parameter(description = "Production batch unique identifier", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID batchId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Waste event details")
            @Valid @RequestBody RecordWasteRequest request) {
        
        WasteEvent wasteEvent = productionService.recordWaste(
                batchId,
                request.getItemId(),
                request.getQuantity(),
                request.getUnit(),
                request.getReason(),
                request.getRecordedBy(),
                request.getNotes()
        );
        return ResponseEntity.ok(wasteEvent);
    }

    @GetMapping("/waste")
    @Operation(
        summary = "Get waste events",
        description = "Retrieve waste events filtered by batch ID, item ID, or all events if no filter specified."
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Waste events retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = WasteEvent.class, type = "array")
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required. JWT token missing or invalid."
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions. SHIFT_LEAD or higher role required to view waste events."
        )
    })
    public ResponseEntity<List<WasteEvent>> getWasteEvents(
            @Parameter(description = "Filter by production batch ID", example = "550e8400-e29b-41d4-a716-446655440000")
            @RequestParam(required = false) UUID batchId,
            @Parameter(description = "Filter by inventory item ID", example = "550e8400-e29b-41d4-a716-446655440001")
            @RequestParam(required = false) UUID itemId) {
        
        if (batchId != null) {
            return ResponseEntity.ok(productionService.getWasteEventsByBatch(batchId));
        } else if (itemId != null) {
            return ResponseEntity.ok(productionService.getWasteEventsByItem(itemId));
        } else {
            // For now, return empty list if no filters specified
            // TODO: Implement getAllWasteEvents in service
            return ResponseEntity.ok(List.of());
        }
    }

    @PostMapping("/waste")
    @Operation(
        summary = "Record general waste",
        description = "Record waste not associated with a specific production batch. Used for general inventory waste or spoilage.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "General waste event details",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = RecordWasteRequest.class),
                examples = @ExampleObject(
                    name = "general-waste",
                    summary = "General inventory waste",
                    value = "{\"itemId\": \"550e8400-e29b-41d4-a716-446655440000\", \"quantity\": 2.0, \"unit\": \"lbs\", \"reason\": \"ACCIDENT\", \"recordedBy\": \"550e8400-e29b-41d4-a716-446655440002\", \"notes\": \"Dropped container during shift change\"}"
                )
            )
        )
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "General waste event recorded successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = WasteEvent.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid waste data or insufficient inventory quantity"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required. JWT token missing or invalid."
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions. TEAM_MEMBER or higher role required."
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Inventory item not found"
        )
    })
    public ResponseEntity<WasteEvent> recordGeneralWaste(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "General waste event details")
        @Valid @RequestBody RecordWasteRequest request) {
        WasteEvent wasteEvent = productionService.recordWaste(
                null, // No batch associated
                request.getItemId(),
                request.getQuantity(),
                request.getUnit(),
                request.getReason(),
                request.getRecordedBy(),
                request.getNotes()
        );
        return ResponseEntity.ok(wasteEvent);
    }

    @GetMapping("/batches/{batchId}/waste")
    @Operation(
        summary = "Get batch waste events",
        description = "Retrieve all waste events associated with a specific production batch."
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Batch waste events retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = WasteEvent.class, type = "array")
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required. JWT token missing or invalid."
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions. SHIFT_LEAD or higher role required."
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Production batch not found"
        )
    })
    public ResponseEntity<List<WasteEvent>> getBatchWaste(
        @Parameter(description = "Production batch unique identifier", example = "550e8400-e29b-41d4-a716-446655440000")
        @PathVariable UUID batchId) {
        return ResponseEntity.ok(productionService.getWasteEventsByBatch(batchId));
    }

    @GetMapping("/waste/item/{itemId}")
    @Operation(
        summary = "Get item waste events",
        description = "Retrieve all waste events for a specific inventory item across all batches."
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Item waste events retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = WasteEvent.class, type = "array")
            )
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Authentication required. JWT token missing or invalid."
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Insufficient permissions. SHIFT_LEAD or higher role required."
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Inventory item not found"
        )
    })
    public ResponseEntity<List<WasteEvent>> getItemWaste(
        @Parameter(description = "Inventory item unique identifier", example = "550e8400-e29b-41d4-a716-446655440000")
        @PathVariable UUID itemId) {
        return ResponseEntity.ok(productionService.getWasteEventsByItem(itemId));
    }

    // Request DTOs
    @Setter
    @Getter
    public static class CreateBatchRequest {
        private UUID productItemId;
        private Double quantityMade;
        private String unit;
        private UUID storageLocationId;
        private UUID madeBy;
        private String notes;

    }

    @Setter
    @Getter
    public static class RecordWasteRequest {
        private UUID itemId;
        private Double quantity;
        private String unit;
        private WasteEvent.WasteReason reason;
        private UUID recordedBy;
        private String notes;

    }
}