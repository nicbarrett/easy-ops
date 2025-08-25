package com.iowaicecreamconcepts.api.auth.controller;

import com.iowaicecreamconcepts.api.auth.model.User;
import com.iowaicecreamconcepts.api.auth.service.AuthService;
import com.iowaicecreamconcepts.api.auth.util.JwtUtil;
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
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
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
    public ResponseEntity<List<User>> getUsers(@RequestParam(required = false) User.Role role) {
        if (role != null) {
            return ResponseEntity.ok(authService.getUsersByRole(role));
        }
        return ResponseEntity.ok(authService.getActiveUsers());
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<User> getUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(authService.getUser(userId));
    }

    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable UUID userId,
            @RequestBody UpdateRoleRequest request) {
        
        User user = authService.updateUserRole(userId, request.getRole());
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/users/{userId}/deactivate")
    public ResponseEntity<User> deactivateUser(@PathVariable UUID userId) {
        User user = authService.deactivateUser(userId);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/users/{userId}/activate")
    public ResponseEntity<User> activateUser(@PathVariable UUID userId) {
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