package com.iowaicecreamconcepts.api.auth.repository;

import com.iowaicecreamconcepts.api.auth.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    private User adminUser;
    private User teamMember;
    private User inactiveUser;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .name("Admin User")
                .email("admin@test.com")
                .passwordHash("hashedPassword1")
                .role(User.Role.ADMIN)
                .isActive(true)
                .build();

        teamMember = User.builder()
                .name("Team Member")
                .email("member@test.com")
                .passwordHash("hashedPassword2")
                .role(User.Role.TEAM_MEMBER)
                .isActive(true)
                .build();

        inactiveUser = User.builder()
                .name("Inactive User")
                .email("inactive@test.com")
                .passwordHash("hashedPassword3")
                .role(User.Role.TEAM_MEMBER)
                .isActive(false)
                .build();

        entityManager.persistAndFlush(adminUser);
        entityManager.persistAndFlush(teamMember);
        entityManager.persistAndFlush(inactiveUser);
    }

    @Test
    void findByEmail_WhenEmailExists_ShouldReturnUser() {
        // When
        Optional<User> result = userRepository.findByEmail("admin@test.com");

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Admin User");
        assertThat(result.get().getRole()).isEqualTo(User.Role.ADMIN);
    }

    @Test
    void findByEmail_WhenEmailNotExists_ShouldReturnEmpty() {
        // When
        Optional<User> result = userRepository.findByEmail("nonexistent@test.com");

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void findByRole_ShouldReturnUsersWithRole() {
        // When
        List<User> result = userRepository.findByRole(User.Role.TEAM_MEMBER);

        // Then
        assertThat(result).hasSize(2); // teamMember and inactiveUser
        assertThat(result).extracting(User::getRole)
                .containsOnly(User.Role.TEAM_MEMBER);
        assertThat(result).extracting(User::getName)
                .containsExactlyInAnyOrder("Team Member", "Inactive User");
    }

    @Test
    void findByRole_WithAdminRole_ShouldReturnAdminUsers() {
        // When
        List<User> result = userRepository.findByRole(User.Role.ADMIN);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getName()).isEqualTo("Admin User");
    }

    @Test
    void findByIsActiveTrue_ShouldReturnOnlyActiveUsers() {
        // When
        List<User> result = userRepository.findByIsActiveTrue();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).extracting(User::getIsActive).containsOnly(true);
        assertThat(result).extracting(User::getName)
                .containsExactlyInAnyOrder("Admin User", "Team Member");
    }

    @Test
    void existsByEmail_WhenEmailExists_ShouldReturnTrue() {
        // When
        boolean result = userRepository.existsByEmail("admin@test.com");

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void existsByEmail_WhenEmailNotExists_ShouldReturnFalse() {
        // When
        boolean result = userRepository.existsByEmail("nonexistent@test.com");

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void existsByEmail_WithDifferentCase_ShouldReturnFalse() {
        // When
        boolean result = userRepository.existsByEmail("ADMIN@TEST.COM");

        // Then
        assertThat(result).isFalse(); // Repository method is case-sensitive
    }
}