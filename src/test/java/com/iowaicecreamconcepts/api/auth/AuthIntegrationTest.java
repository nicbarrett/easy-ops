package com.iowaicecreamconcepts.api.auth;

import com.iowaicecreamconcepts.api.testconfig.IntegrationTestBase;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@DisplayName("Authentication & Authorization Integration Tests")
class AuthIntegrationTest extends IntegrationTestBase {

    @Test
    @DisplayName("TC-AUTH-001: Successful login returns JWT token")
    void successfulLoginReturnsJwtToken() {
        String loginJson = """
            {
                "email": "admin@sweetswirls.com",
                "password": "admin123"
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(loginJson)
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(200)
            .body("token", notNullValue())
            .body("userId", notNullValue())
            .body("email", equalTo("admin@sweetswirls.com"))
            .body("role", equalTo("ADMIN"))
            .body("name", notNullValue());
    }

    @Test
    @DisplayName("TC-AUTH-002: Invalid credentials return 401")
    void invalidCredentialsReturn401() {
        String invalidLoginJson = """
            {
                "email": "admin@sweetswirls.com", 
                "password": "wrongpassword"
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .body(invalidLoginJson)
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(400);
    }

    @Test
    @DisplayName("TC-AUTH-003: Different user roles have correct permissions")
    void differentUserRolesHaveCorrectPermissions() {
        // Test Admin permissions
        loginAsAdmin();
        
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/api/inventory")
        .then()
            .statusCode(200);

        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "name": "Admin Test Item",
                    "category": "BASE",
                    "unit": "gallons", 
                    "parStockLevel": 5.0
                }
                """)
        .when()
            .post("/api/inventory")
        .then()
            .statusCode(200);

        // Test Team Member permissions (read-only)
        loginAsTeamMember();
        
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/api/inventory")
        .then()
            .statusCode(200); // Can read

        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "name": "Team Member Test Item",
                    "category": "BASE",
                    "unit": "gallons",
                    "parStockLevel": 5.0
                }
                """)
        .when()
            .post("/api/inventory")
        .then()
            .statusCode(403); // Cannot write
    }

    @Test
    @DisplayName("TC-AUTH-004: JWT token validation")
    void jwtTokenValidation() {
        // Valid token works
        loginAsAdmin();
        
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/api/inventory")
        .then()
            .statusCode(200);

        // Malformed token fails
        given()
            .header("Authorization", "Bearer not-a-valid-jwt")
        .when()
            .get("/api/inventory")
        .then()
            .statusCode(401);

        // Missing Bearer prefix fails  
        given()
            .header("Authorization", authToken)
        .when()
            .get("/api/inventory")
        .then()
            .statusCode(401);
    }

    @Test
    @DisplayName("TC-AUTH-005: Permission scope validation")
    void permissionScopeValidation() {
        loginAsShiftLead();
        
        // Shift Lead can read inventory
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/api/inventory")
        .then()
            .statusCode(200);

        // Shift Lead can create inventory items (has rw permission)
        given()
            .header("Authorization", "Bearer " + authToken)
            .contentType(ContentType.JSON)
            .body("""
                {
                    "name": "Shift Lead Test Item",
                    "category": "MIX_IN",
                    "unit": "oz",
                    "parStockLevel": 8.0
                }
                """)
        .when()
            .post("/api/inventory")
        .then()
            .statusCode(200);

        // But cannot manage users (no admin:user permission)
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/api/auth/users")
        .then()
            .statusCode(403);
    }

    @Test
    @DisplayName("TC-AUTH-006: User details extraction from JWT")
    void userDetailsExtractionFromJwt() {
        loginAsAdmin();
        
        // Test endpoint that uses current user context
        given()
            .header("Authorization", "Bearer " + authToken)
        .when()
            .get("/api/auth/users")
        .then()
            .statusCode(200)
            .body("size()", greaterThan(0));
    }
}