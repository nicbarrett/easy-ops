package com.iowaicecreamconcepts.api;

import com.iowaicecreamconcepts.api.testconfig.IntegrationTestBase;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@DisplayName("Basic API Integration Tests")
class BasicIntegrationTest extends IntegrationTestBase {

    @Test
    @DisplayName("TC-BASIC-001: Application starts and health check responds")
    void applicationStartsAndHealthCheckResponds() {
        given()
        .when()
            .get("/actuator/health")
        .then()
            .statusCode(200)
            .body("status", equalTo("UP"));
    }

    @Test
    @DisplayName("TC-BASIC-002: Login endpoint exists and accepts requests")  
    void loginEndpointExistsAndAcceptsRequests() {
        String loginJson = """
            {
                "email": "test@example.com",
                "password": "testpassword"
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(loginJson)
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(anyOf(equalTo(200), equalTo(400), equalTo(401)));
    }

    @Test
    @DisplayName("TC-BASIC-003: Inventory endpoint exists")
    void inventoryEndpointExists() {
        given()
        .when()
            .get("/api/inventory")
        .then()
            .statusCode(anyOf(equalTo(200), equalTo(401), equalTo(403)));
    }

    @Test
    @DisplayName("TC-BASIC-004: Production endpoints exist")
    void productionEndpointsExist() {
        given()
        .when()
            .get("/api/production/requests")
        .then()
            .statusCode(anyOf(equalTo(200), equalTo(401), equalTo(403)));
            
        given()
        .when()
            .get("/api/production/batches")
        .then()
            .statusCode(anyOf(equalTo(200), equalTo(401), equalTo(403)));
    }

    @Test
    @DisplayName("TC-BASIC-005: API returns JSON content type")
    void apiReturnsJsonContentType() {
        given()
        .when()
            .get("/api/inventory")
        .then()
            .contentType(anyOf(
                equalTo("application/json"),
                equalTo("application/json;charset=UTF-8")
            ));
    }
}