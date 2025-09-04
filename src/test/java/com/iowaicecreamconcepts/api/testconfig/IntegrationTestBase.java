package com.iowaicecreamconcepts.api.testconfig;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import static io.restassured.RestAssured.given;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class IntegrationTestBase {

    @LocalServerPort
    private Integer port;

    @Autowired
    protected ObjectMapper objectMapper;
    
    protected String authToken;

    @BeforeEach
    void setUp() {
        RestAssured.baseURI = "http://localhost:" + port;
        RestAssured.port = port;
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
    }

    protected String loginAndGetToken(String email, String password) {
        return RestAssured.given()
                .contentType(ContentType.JSON)
                .body(String.format("{\"email\":\"%s\",\"password\":\"%s\"}", email, password))
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(200)
                .extract()
                .path("token");
    }

    protected void loginAsAdmin() {
        authToken = loginAndGetToken("admin@sweetswirls.com", "admin123");
    }

    protected void loginAsProductionLead() {
        authToken = loginAndGetToken("production@sweetswirls.com", "production123");
    }

    protected void loginAsShiftLead() {
        authToken = loginAndGetToken("shift@sweetswirls.com", "shift123");
    }

    protected void loginAsTeamMember() {
        authToken = loginAndGetToken("team@sweetswirls.com", "team123");
    }

    protected String getCurrentUserId() {
        // Extract user ID from JWT token payload (it's already in the token)
        // For testing purposes, we'll decode the JWT to get the userId
        String[] tokenParts = authToken.split("\\.");
        if (tokenParts.length >= 2) {
            try {
                String payload = new String(java.util.Base64.getUrlDecoder().decode(tokenParts[1]));
                // Extract userId from JSON payload using simple string parsing
                String userIdPrefix = "\"userId\":\"";
                int startIndex = payload.indexOf(userIdPrefix) + userIdPrefix.length();
                int endIndex = payload.indexOf("\"", startIndex);
                return payload.substring(startIndex, endIndex);
            } catch (Exception e) {
                // Fallback to production lead UUID if parsing fails
                return "ee23b4b9-532e-4340-b57b-f63171c90de1";
            }
        }
        return "ee23b4b9-532e-4340-b57b-f63171c90de1"; // Default production lead UUID
    }
}