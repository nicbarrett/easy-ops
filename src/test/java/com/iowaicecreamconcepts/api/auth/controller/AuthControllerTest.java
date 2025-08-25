package com.iowaicecreamconcepts.api.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iowaicecreamconcepts.api.auth.model.User;
import com.iowaicecreamconcepts.api.auth.service.AuthService;
import com.iowaicecreamconcepts.api.auth.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;
    
    @MockBean
    private PasswordEncoder passwordEncoder;
    
    @MockBean
    private JwtUtil jwtUtil;

    private User testUser;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUser = User.builder()
                .id(testUserId)
                .name("Test User")
                .email("test@example.com")
                .passwordHash("hashedPassword")
                .role(User.Role.TEAM_MEMBER)
                .isActive(true)
                .build();
    }

    @Test
    void login_WithValidCredentials_ShouldReturnUserInfo() throws Exception {
        // Given
        when(authService.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password", "hashedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(testUser)).thenReturn("fake-jwt-token");

        AuthController.LoginRequest loginRequest = new AuthController.LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password");

        // When/Then
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(testUserId.toString()))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.role").value("TEAM_MEMBER"))
                .andExpect(jsonPath("$.token").value("fake-jwt-token"));

        verify(authService).findByEmail("test@example.com");
        verify(passwordEncoder).matches("password", "hashedPassword");
        verify(jwtUtil).generateToken(testUser);
    }

    @Test
    void login_WithInvalidCredentials_ShouldReturnBadRequest() throws Exception {
        // Given
        when(authService.findByEmail("test@example.com")).thenReturn(Optional.empty());

        AuthController.LoginRequest loginRequest = new AuthController.LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password");

        // When/Then
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());

        verify(authService).findByEmail("test@example.com");
        verifyNoInteractions(passwordEncoder, jwtUtil);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createUser_WithValidData_ShouldCreateUser() throws Exception {
        // Given
        when(passwordEncoder.encode("password")).thenReturn("hashed_password");
        when(authService.createUser("Test User", "test@example.com", "hashed_password", User.Role.TEAM_MEMBER))
                .thenReturn(testUser);

        AuthController.CreateUserRequest createRequest = new AuthController.CreateUserRequest();
        createRequest.setName("Test User");
        createRequest.setEmail("test@example.com");
        createRequest.setPassword("password");
        createRequest.setRole(User.Role.TEAM_MEMBER);

        // When/Then
        mockMvc.perform(post("/api/auth/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@example.com"));

        verify(passwordEncoder).encode("password");
        verify(authService).createUser("Test User", "test@example.com", "hashed_password", User.Role.TEAM_MEMBER);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUsers_ShouldReturnActiveUsers() throws Exception {
        // Given
        when(authService.getActiveUsers()).thenReturn(Collections.singletonList(testUser));

        // When/Then
        mockMvc.perform(get("/api/auth/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Test User"));

        verify(authService).getActiveUsers();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUsers_WithRole_ShouldReturnUsersWithRole() throws Exception {
        // Given
        when(authService.getUsersByRole(User.Role.TEAM_MEMBER)).thenReturn(Collections.singletonList(testUser));

        // When/Then
        mockMvc.perform(get("/api/auth/users")
                        .param("role", "TEAM_MEMBER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].role").value("TEAM_MEMBER"));

        verify(authService).getUsersByRole(User.Role.TEAM_MEMBER);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUser_WithValidId_ShouldReturnUser() throws Exception {
        // Given
        when(authService.getUser(testUserId)).thenReturn(testUser);

        // When/Then
        mockMvc.perform(get("/api/auth/users/" + testUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test User"));

        verify(authService).getUser(testUserId);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateUserRole_WithValidData_ShouldUpdateRole() throws Exception {
        // Given
        User updatedUser = User.builder()
                .id(testUserId)
                .name("Test User")
                .email("test@example.com")
                .role(User.Role.ADMIN)
                .build();
        when(authService.updateUserRole(testUserId, User.Role.ADMIN)).thenReturn(updatedUser);

        AuthController.UpdateRoleRequest updateRequest = new AuthController.UpdateRoleRequest();
        updateRequest.setRole(User.Role.ADMIN);

        // When/Then
        mockMvc.perform(patch("/api/auth/users/" + testUserId + "/role")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));

        verify(authService).updateUserRole(testUserId, User.Role.ADMIN);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deactivateUser_WithValidId_ShouldDeactivateUser() throws Exception {
        // Given
        User deactivatedUser = User.builder()
                .id(testUserId)
                .name("Test User")
                .email("test@example.com")
                .isActive(false)
                .build();
        when(authService.deactivateUser(testUserId)).thenReturn(deactivatedUser);

        // When/Then
        mockMvc.perform(patch("/api/auth/users/" + testUserId + "/deactivate")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));

        verify(authService).deactivateUser(testUserId);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void activateUser_WithValidId_ShouldActivateUser() throws Exception {
        // Given
        when(authService.activateUser(testUserId)).thenReturn(testUser);

        // When/Then
        mockMvc.perform(patch("/api/auth/users/" + testUserId + "/activate")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(true));

        verify(authService).activateUser(testUserId);
    }
}