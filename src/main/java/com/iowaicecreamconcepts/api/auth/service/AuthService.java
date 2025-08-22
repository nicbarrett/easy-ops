package com.iowaicecreamconcepts.api.auth.service;

import com.iowaicecreamconcepts.api.auth.model.User;
import com.iowaicecreamconcepts.api.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public User createUser(String name, String email, String passwordHash, User.Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User with email already exists");
        }

        User user = User.builder()
                .name(name)
                .email(email)
                .passwordHash(passwordHash)
                .role(role)
                .build();

        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User getUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> getActiveUsers() {
        return userRepository.findByIsActiveTrue();
    }

    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    public User updateUserRole(UUID userId, User.Role role) {
        User user = getUser(userId);
        user.setRole(role);
        return userRepository.save(user);
    }

    public User deactivateUser(UUID userId) {
        User user = getUser(userId);
        user.setIsActive(false);
        return userRepository.save(user);
    }

    public User activateUser(UUID userId) {
        User user = getUser(userId);
        user.setIsActive(true);
        return userRepository.save(user);
    }
}