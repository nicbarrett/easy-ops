package com.iowaicecreamconcepts.api.inventory.controller;

import com.iowaicecreamconcepts.api.inventory.dto.InventoryItemRequest;
import com.iowaicecreamconcepts.api.inventory.model.InventoryItem;
import com.iowaicecreamconcepts.api.inventory.service.InventoryService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin // enable CORS for frontend dev
@Tag(name = "Inventory", description = "Endpoints for managing inventory items including CRUD operations, stock tracking, and item categorization. Supports ice cream ingredients, packaging materials, and supplies.")
public class InventoryController {

    private final InventoryService service;

    public InventoryController(InventoryService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasPermission(null, 'inventory:item:r')")
    @Operation(
        summary = "Get all inventory items",
        description = "Retrieve a complete list of all inventory items including their current stock levels, par levels, and locations. Results include both active and inactive items."
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "List of inventory items retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = InventoryItem.class, type = "array")
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
            description = "Insufficient permissions. Valid role required to view inventory.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "forbidden",
                    summary = "Insufficient permissions",
                    value = "{\"error\": \"Insufficient permissions to view inventory\"}"
                )
            )
        )
    })
    public List<InventoryItem> getAllItems() {
        return service.getAllItems();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasPermission(null, 'inventory:item:r')")
    @Operation(
        summary = "Get inventory item by ID",
        description = "Retrieve a specific inventory item by its unique identifier, including detailed information about stock levels, location, and supplier details."
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Inventory item retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = InventoryItem.class)
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
            description = "Insufficient permissions. Valid role required to view inventory items.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "forbidden",
                    summary = "Insufficient permissions",
                    value = "{\"error\": \"Insufficient permissions to view inventory\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Inventory item not found",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "not-found",
                    summary = "Item does not exist",
                    value = "{\"error\": \"Inventory item not found\"}"
                )
            )
        )
    })
    public ResponseEntity<InventoryItem> getItemById(
        @Parameter(description = "Inventory item unique identifier", example = "550e8400-e29b-41d4-a716-446655440000")
        @PathVariable UUID id) {
        return service.getItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasPermission(null, 'inventory:item:rw')")
    @Operation(
        summary = "Create new inventory item",
        description = "Create a new inventory item with specified details including name, category, unit, par stock level, and location. Item names must be unique.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Inventory item details",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = InventoryItemRequest.class),
                examples = {
                    @ExampleObject(
                        name = "vanilla-extract",
                        summary = "Vanilla extract ingredient",
                        value = "{\"name\": \"Vanilla Extract\", \"category\": \"INGREDIENT\", \"unit\": \"fl oz\", \"parStockLevel\": 32, \"location\": \"PANTRY\", \"sku\": \"VAN-001\", \"notes\": \"Premium Madagascar vanilla\"}"
                    ),
                    @ExampleObject(
                        name = "pint-container",
                        summary = "Pint ice cream container",
                        value = "{\"name\": \"Pint Containers\", \"category\": \"PACKAGING\", \"unit\": \"each\", \"parStockLevel\": 500, \"location\": \"STORAGE\", \"sku\": \"PKG-PINT\"}"
                    )
                }
            )
        )
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Inventory item created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = InventoryItem.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid item data or duplicate item name",
            content = @Content(
                mediaType = "application/json",
                examples = {
                    @ExampleObject(
                        name = "duplicate-name",
                        summary = "Item name already exists",
                        value = "{\"error\": \"Item with this name already exists\"}"
                    ),
                    @ExampleObject(
                        name = "invalid-par-level",
                        summary = "Invalid par stock level",
                        value = "{\"error\": \"Par stock level must be greater than or equal to 0\"}"
                    )
                }
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
            description = "Insufficient permissions. ADMIN or PRODUCTION_LEAD role required.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "forbidden",
                    summary = "Insufficient permissions",
                    value = "{\"error\": \"Insufficient permissions to create inventory items\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "422",
            description = "Validation error. Missing required fields or invalid field values.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "validation-error",
                    summary = "Missing required fields",
                    value = "{\"errors\": [{\"field\": \"name\", \"message\": \"Name is required\"}, {\"field\": \"unit\", \"message\": \"Unit is required\"}]}"
                )
            )
        )
    })
    public ResponseEntity<InventoryItem> createItem(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Inventory item to create")
        @Valid @RequestBody InventoryItemRequest itemRequest) {
        InventoryItem item = InventoryItem.fromRequest(itemRequest);
        return ResponseEntity.ok(service.createItem(item));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasPermission(null, 'inventory:item:rw')")
    @Operation(
        summary = "Update inventory item",
        description = "Update an existing inventory item's details. All fields in the request will replace the current values.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Updated inventory item details",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = InventoryItemRequest.class),
                examples = @ExampleObject(
                    name = "update-par-level",
                    summary = "Update par stock level",
                    value = "{\"name\": \"Vanilla Extract\", \"category\": \"INGREDIENT\", \"unit\": \"fl oz\", \"parStockLevel\": 48, \"location\": \"PANTRY\", \"sku\": \"VAN-001\", \"notes\": \"Premium Madagascar vanilla - increased par level\"}"
                )
            )
        )
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Inventory item updated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = InventoryItem.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid item data or duplicate item name",
            content = @Content(
                mediaType = "application/json",
                examples = {
                    @ExampleObject(
                        name = "duplicate-name",
                        summary = "Item name conflicts with existing item",
                        value = "{\"error\": \"Another item with this name already exists\"}"
                    ),
                    @ExampleObject(
                        name = "invalid-data",
                        summary = "Invalid field values",
                        value = "{\"error\": \"Par stock level must be greater than or equal to 0\"}"
                    )
                }
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
            description = "Insufficient permissions. ADMIN or PRODUCTION_LEAD role required.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "forbidden",
                    summary = "Insufficient permissions",
                    value = "{\"error\": \"Insufficient permissions to update inventory items\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Inventory item not found",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "not-found",
                    summary = "Item does not exist",
                    value = "{\"error\": \"Inventory item not found\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "422",
            description = "Validation error. Missing required fields or invalid field values.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "validation-error",
                    summary = "Invalid field values",
                    value = "{\"errors\": [{\"field\": \"name\", \"message\": \"Name cannot be empty\"}, {\"field\": \"unit\", \"message\": \"Unit is required\"}]}"
                )
            )
        )
    })
    public ResponseEntity<InventoryItem> updateItem(
        @Parameter(description = "Inventory item unique identifier", example = "550e8400-e29b-41d4-a716-446655440000")
        @PathVariable UUID id,
        @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Updated inventory item details")
        @Valid @RequestBody InventoryItemRequest itemRequest) {
        InventoryItem item = InventoryItem.fromRequest(itemRequest);
        return ResponseEntity.ok(service.updateItem(id, item));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission(null, 'inventory:item:rw')")
    @Operation(
        summary = "Delete inventory item",
        description = "Soft delete an inventory item. The item will be marked as inactive but not permanently removed from the database to preserve audit trails and historical data."
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "204",
            description = "Inventory item deleted successfully. No content returned."
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
            description = "Insufficient permissions. ADMIN role required to delete inventory items.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "forbidden",
                    summary = "Insufficient permissions",
                    value = "{\"error\": \"ADMIN role required to delete inventory items\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Inventory item not found",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "not-found",
                    summary = "Item does not exist",
                    value = "{\"error\": \"Inventory item not found\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Cannot delete item due to dependencies. Item may be referenced in active sessions or production batches.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "has-dependencies",
                    summary = "Item has active references",
                    value = "{\"error\": \"Cannot delete item: referenced in active inventory sessions\"}"
                )
            )
        )
    })
    public ResponseEntity<Void> deleteItem(
        @Parameter(description = "Inventory item unique identifier", example = "550e8400-e29b-41d4-a716-446655440000")
        @PathVariable UUID id) {
        service.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}