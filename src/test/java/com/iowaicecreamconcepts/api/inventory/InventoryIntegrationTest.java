package com.iowaicecreamconcepts.api.inventory;

import com.iowaicecreamconcepts.api.inventory.model.InventoryItem;
import com.iowaicecreamconcepts.api.testconfig.IntegrationTestBase;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@DisplayName("Inventory Management Integration Tests")
class InventoryIntegrationTest extends IntegrationTestBase {

    @Test
    @DisplayName("TC-API-001: Admin can create inventory item")
    void adminCanCreateInventoryItem() {
        loginAsAdmin();

        String itemJson = """
            {
                "name": "Integration Test Item",
                "category": "BASE",
                "unit": "gallons",
                "parStockLevel": 10.0,
                "sku": "TEST-001",
                "notes": "Test item for integration"
            }
            """;

        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(itemJson)
        .when()
            .post("/api/inventory")
        .then()
            .statusCode(200)
            .body("name", equalTo("Integration Test Item"))
            .body("category", equalTo("BASE"))
            .body("parStockLevel", equalTo(10.0f))
            .body("sku", equalTo("TEST-001"))
            .body("isActive", equalTo(true))
            .body("id", notNullValue());
    }

    @Test
    @DisplayName("TC-API-002: Team member cannot create inventory item")
    void teamMemberCannotCreateInventoryItem() {
        loginAsTeamMember();

        String itemJson = """
            {
                "name": "Unauthorized Item",
                "category": "BASE",
                "unit": "gallons",
                "parStockLevel": 5.0
            }
            """;

        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(itemJson)
        .when()
            .post("/api/inventory")
        .then()
            .statusCode(403);
    }

    @Test
    @DisplayName("TC-API-003: Get all inventory items returns seeded data")
    void getAllInventoryItemsReturnsSeededData() {
        loginAsAdmin();

        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/api/inventory")
        .then()
            .statusCode(200)
            .body("size()", greaterThan(0))
            .body("[0].id", notNullValue())
            .body("[0].name", notNullValue())
            .body("[0].category", isOneOf("BASE", "MIX_IN", "PACKAGING", "BEVERAGE", "BAKED_GOODS", "PREPARED_ITEMS"))
            .body("[0].isActive", equalTo(true));
    }

    @Test
    @DisplayName("TC-API-004: Update inventory item")
    void updateInventoryItem() {
        loginAsAdmin();

        // First create an item
        String createJson = """
            {
                "name": "Update Test Item",
                "category": "MIX_IN",
                "unit": "lbs", 
                "parStockLevel": 5.0
            }
            """;

        String itemId = given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(createJson)
        .when()
            .post("/api/inventory")
        .then()
            .statusCode(200)
            .extract()
            .path("id");

        // Update the item
        String updateJson = """
            {
                "name": "Updated Test Item",
                "category": "MIX_IN",
                "unit": "lbs",
                "parStockLevel": 10.0,
                "notes": "Updated notes"
            }
            """;

        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(updateJson)
        .when()
            .put("/api/inventory/" + itemId)
        .then()
            .statusCode(200)
            .body("name", equalTo("Updated Test Item"))
            .body("parStockLevel", equalTo(10.0f))
            .body("notes", equalTo("Updated notes"));
    }

    @Test
    @DisplayName("TC-API-005: Delete inventory item (soft delete)")
    void deleteInventoryItem() {
        loginAsAdmin();

        // Create item first
        String createJson = """
            {
                "name": "Delete Test Item", 
                "category": "PACKAGING",
                "unit": "pieces",
                "parStockLevel": 100.0
            }
            """;

        String itemId = given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(createJson)
        .when()
            .post("/api/inventory")
        .then()
            .statusCode(200)
            .extract()
            .path("id");

        // Delete the item
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .delete("/api/inventory/" + itemId)
        .then()
            .statusCode(204);

        // Verify item is soft deleted (not returned in active items list)
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/api/inventory")
        .then()
            .statusCode(200)
            .body("find { it.id == '" + itemId + "' }", nullValue());
    }

    @Test
    @DisplayName("TC-API-006: Validation errors for invalid item data")
    void validationErrorsForInvalidItemData() {
        loginAsAdmin();

        // Missing required fields
        String invalidJson = """
            {
                "category": "BASE",
                "unit": "gallons"
            }
            """;

        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(invalidJson)
        .when()
            .post("/api/inventory")
        .then()
            .statusCode(400);

        // Invalid par stock level
        String negativeParJson = """
            {
                "name": "Invalid Par Item",
                "category": "BASE", 
                "unit": "gallons",
                "parStockLevel": -5.0
            }
            """;

        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body(negativeParJson)
        .when()
            .post("/api/inventory")
        .then()
            .statusCode(400);
    }

    @Test
    @DisplayName("TC-API-007: Unauthorized access returns 401")
    void unauthorizedAccessReturns401() {
        // No auth token
        given()
        .when()
            .get("/api/inventory")
        .then()
            .statusCode(401);

        // Invalid token
        given()
            .header("Authorization", "Bearer invalid-token")
        .when()
            .get("/api/inventory")
        .then()
            .statusCode(401);
    }
}