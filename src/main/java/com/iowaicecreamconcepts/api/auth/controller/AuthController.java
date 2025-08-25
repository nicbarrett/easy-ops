package com.iowaicecreamconcepts.api.auth.controller;

import com.iowaicecreamconcepts.api.auth.model.User;
import com.iowaicecreamconcepts.api.auth.service.AuthService;
import com.iowaicecreamconcepts.api.auth.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user authentication, authorization, and user management. Includes login functionality and user lifecycle operations.")
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    @Operation(
        summary = "Authenticate user", 
        description = "Authenticate a user with email and password credentials. Returns a JWT token for subsequent API requests along with user profile information.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Login credentials",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = LoginRequest.class),
                examples = @ExampleObject(
                    name = "login-example",
                    summary = "Standard login request",
                    value = "{\"email\": \"admin@sweetswirls.com\", \"password\": \"password123\"}"
                )
            )
        )
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Authentication successful. JWT token and user profile returned.",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = LoginResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Authentication failed. Invalid email or password provided.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "auth-failure",
                    summary = "Invalid credentials",
                    value = "{\"error\": \"Invalid email or password\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "422", 
            description = "Validation error. Missing or malformed request body.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "validation-error",
                    summary = "Missing required fields",
                    value = "{\"error\": \"Email and password are required\"}"
                )
            )
        )
    })
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = authService.findByEmail(request.getEmail());
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = userOpt.get();
        
        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().build();
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user);
        
        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setToken(token);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/users")
    @Operation(
        summary = "Create new user", 
        description = "Create a new user account with specified role and credentials. Requires ADMIN role permissions.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "User creation details",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = CreateUserRequest.class),
                examples = @ExampleObject(
                    name = "create-user-example",
                    summary = "Create production lead user",
                    value = "{\"name\": \"John Smith\", \"email\": \"john@sweetswirls.com\", \"password\": \"securePassword123\", \"role\": \"PRODUCTION_LEAD\"}"
                )
            )
        )
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "User created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = User.class)
            )
        ),
        @ApiResponse(
            responseCode = "400", 
            description = "Invalid user data or email already exists",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "duplicate-email",
                    summary = "Email already exists",
                    value = "{\"error\": \"User with this email already exists\"}"
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
                    summary = "Missing or invalid token",
                    value = "{\"error\": \"Authentication required\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "403", 
            description = "Insufficient permissions. ADMIN role required.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "forbidden",
                    summary = "Insufficient permissions",
                    value = "{\"error\": \"ADMIN role required to create users\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "422", 
            description = "Validation error. Invalid field values or missing required fields.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "validation-error",
                    summary = "Invalid role or missing fields",
                    value = "{\"error\": \"Invalid role specified\"}"
                )
            )
        )
    })
    public ResponseEntity<User> createUser(@RequestBody CreateUserRequest request) {
        // Hash password properly
        String passwordHash = passwordEncoder.encode(request.getPassword());
        
        User user = authService.createUser(
                request.getName(),
                request.getEmail(),
                passwordHash,
                request.getRole()
        );
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users")
    @Operation(
        summary = "Get users",
        description = "Retrieve list of users, optionally filtered by role. Returns active users by default."
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "List of users retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = User.class, type = "array")
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
                    value = "{\"error\": \"Insufficient permissions to view users\"}"
                )
            )
        )
    })
    public ResponseEntity<List<User>> getUsers(
        @Parameter(description = "Filter users by role", example = "PRODUCTION_LEAD")
        @RequestParam(required = false) User.Role role) {
        if (role != null) {
            return ResponseEntity.ok(authService.getUsersByRole(role));
        }
        return ResponseEntity.ok(authService.getActiveUsers());
    }

    @GetMapping("/users/{userId}")
    @Operation(
        summary = "Get user by ID",
        description = "Retrieve a specific user by their unique identifier."
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = User.class)
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
            description = "Insufficient permissions. ADMIN role or own user ID required.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "forbidden",
                    summary = "Insufficient permissions",
                    value = "{\"error\": \"Cannot access other users' data\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User not found",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "not-found",
                    summary = "User does not exist",
                    value = "{\"error\": \"User not found\"}"
                )
            )
        )
    })
    public ResponseEntity<User> getUser(
        @Parameter(description = "User unique identifier", example = "550e8400-e29b-41d4-a716-446655440000")
        @PathVariable UUID userId) {
        return ResponseEntity.ok(authService.getUser(userId));
    }

    @PatchMapping("/users/{userId}/role")
    @Operation(
        summary = "Update user role",
        description = "Update a user's role. Requires ADMIN permissions.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "New role assignment",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UpdateRoleRequest.class),
                examples = @ExampleObject(
                    name = "role-update-example",
                    summary = "Promote to shift lead",
                    value = "{\"role\": \"SHIFT_LEAD\"}"
                )
            )
        )
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User role updated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = User.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid role specified",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "invalid-role",
                    summary = "Role validation error",
                    value = "{\"error\": \"Invalid role specified\"}"
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
            description = "Insufficient permissions. ADMIN role required.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "forbidden",
                    summary = "Insufficient permissions",
                    value = "{\"error\": \"ADMIN role required to update user roles\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User not found",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "not-found",
                    summary = "User does not exist",
                    value = "{\"error\": \"User not found\"}"
                )
            )
        )
    })
    public ResponseEntity<User> updateUserRole(
            @Parameter(description = "User unique identifier", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID userId,
            @RequestBody UpdateRoleRequest request) {
        
        User user = authService.updateUserRole(userId, request.getRole());
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/users/{userId}/deactivate")
    @Operation(
        summary = "Deactivate user",
        description = "Deactivate a user account. Deactivated users cannot log in but their data is preserved. Requires ADMIN permissions."
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User deactivated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = User.class)
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
            description = "Insufficient permissions. ADMIN role required.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "forbidden",
                    summary = "Insufficient permissions",
                    value = "{\"error\": \"ADMIN role required to deactivate users\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User not found",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "not-found",
                    summary = "User does not exist",
                    value = "{\"error\": \"User not found\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "409",
            description = "User is already deactivated",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "already-deactivated",
                    summary = "User already inactive",
                    value = "{\"error\": \"User is already deactivated\"}"
                )
            )
        )
    })
    public ResponseEntity<User> deactivateUser(
        @Parameter(description = "User unique identifier", example = "550e8400-e29b-41d4-a716-446655440000")
        @PathVariable UUID userId) {
        User user = authService.deactivateUser(userId);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/users/{userId}/activate")
    @Operation(
        summary = "Activate user",
        description = "Reactivate a deactivated user account. Requires ADMIN permissions."
    )
    @SecurityRequirement(name = "Bearer Authentication")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "User activated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = User.class)
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
            description = "Insufficient permissions. ADMIN role required.",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "forbidden",
                    summary = "Insufficient permissions",
                    value = "{\"error\": \"ADMIN role required to activate users\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "User not found",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "not-found",
                    summary = "User does not exist",
                    value = "{\"error\": \"User not found\"}"
                )
            )
        ),
        @ApiResponse(
            responseCode = "409",
            description = "User is already active",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "already-active",
                    summary = "User already active",
                    value = "{\"error\": \"User is already active\"}"
                )
            )
        )
    })
    public ResponseEntity<User> activateUser(
        @Parameter(description = "User unique identifier", example = "550e8400-e29b-41d4-a716-446655440000")
        @PathVariable UUID userId) {
        User user = authService.activateUser(userId);
        return ResponseEntity.ok(user);
    }

    // Request/Response DTOs
    @Setter
    @Getter
    public static class LoginRequest {
        private String email;
        private String password;

    }

    @Setter
    @Getter
    public static class LoginResponse {
        private UUID userId;
        private String name;
        private String email;
        private User.Role role;
        private String token;

    }

    @Setter
    @Getter
    public static class CreateUserRequest {
        private String name;
        private String email;
        private String password;
        private User.Role role;

    }

    @Setter
    @Getter
    public static class UpdateRoleRequest {
        private User.Role role;

    }
}