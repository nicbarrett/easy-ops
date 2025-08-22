package com.iowaicecreamconcepts.api.auth.service;

import com.iowaicecreamconcepts.api.auth.model.User;
import com.iowaicecreamconcepts.api.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

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
    void createUser_WhenEmailIsUnique_ShouldCreateUser() {
        // Given
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = authService.createUser("Test User", "test@example.com", "hashedPassword", User.Role.TEAM_MEMBER);

        // Then
        assertThat(result).isEqualTo(testUser);
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_WhenEmailExists_ShouldThrowException() {
        // Given
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // When/Then
        assertThatThrownBy(() -> authService.createUser("Test User", "test@example.com", "hashedPassword", User.Role.TEAM_MEMBER))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User with email already exists");
        
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any());
    }

    @Test
    void findByEmail_WhenUserExists_ShouldReturnUser() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // When
        Optional<User> result = authService.findByEmail("test@example.com");

        // Then
        assertThat(result).isPresent();
        assertThat(result.get()).isEqualTo(testUser);
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void findByEmail_WhenUserNotExists_ShouldReturnEmpty() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        // When
        Optional<User> result = authService.findByEmail("test@example.com");

        // Then
        assertThat(result).isEmpty();
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void getUser_WhenUserExists_ShouldReturnUser() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        // When
        User result = authService.getUser(testUserId);

        // Then
        assertThat(result).isEqualTo(testUser);
        verify(userRepository).findById(testUserId);
    }

    @Test
    void getUser_WhenUserNotExists_ShouldThrowException() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> authService.getUser(testUserId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
        
        verify(userRepository).findById(testUserId);
    }

    @Test
    void getActiveUsers_ShouldReturnActiveUsers() {
        // Given
        List<User> expectedUsers = Arrays.asList(testUser);
        when(userRepository.findByIsActiveTrue()).thenReturn(expectedUsers);

        // When
        List<User> result = authService.getActiveUsers();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(testUser);
        verify(userRepository).findByIsActiveTrue();
    }

    @Test
    void getUsersByRole_ShouldReturnUsersWithRole() {
        // Given
        List<User> expectedUsers = Arrays.asList(testUser);
        when(userRepository.findByRole(User.Role.TEAM_MEMBER)).thenReturn(expectedUsers);

        // When
        List<User> result = authService.getUsersByRole(User.Role.TEAM_MEMBER);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRole()).isEqualTo(User.Role.TEAM_MEMBER);
        verify(userRepository).findByRole(User.Role.TEAM_MEMBER);
    }

    @Test
    void updateUserRole_WhenUserExists_ShouldUpdateRole() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(testUser)).thenReturn(testUser);

        // When
        User result = authService.updateUserRole(testUserId, User.Role.ADMIN);

        // Then
        assertThat(result.getRole()).isEqualTo(User.Role.ADMIN);
        verify(userRepository).findById(testUserId);
        verify(userRepository).save(testUser);
    }

    @Test
    void deactivateUser_WhenUserExists_ShouldDeactivateUser() {
        // Given
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(testUser)).thenReturn(testUser);

        // When
        User result = authService.deactivateUser(testUserId);

        // Then
        assertThat(result.getIsActive()).isFalse();
        verify(userRepository).findById(testUserId);
        verify(userRepository).save(testUser);
    }

    @Test
    void activateUser_WhenUserExists_ShouldActivateUser() {
        // Given
        testUser.setIsActive(false);
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(testUser)).thenReturn(testUser);

        // When
        User result = authService.activateUser(testUserId);

        // Then
        assertThat(result.getIsActive()).isTrue();
        verify(userRepository).findById(testUserId);
        verify(userRepository).save(testUser);
    }
}