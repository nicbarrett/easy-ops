package com.iowaicecreamconcepts.api.auth.service;

import com.iowaicecreamconcepts.api.auth.model.User;
import com.iowaicecreamconcepts.api.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PermissionService permissionService;

    public User createUser(String firstName, String lastName, String email, String phone, 
                          String passwordHash, User.Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User with email already exists");
        }

        Set<String> defaultPermissions = permissionService.getDefaultPermissionsForRole(role);

        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .phone(phone)
                .passwordHash(passwordHash)
                .role(role)
                .permissions(defaultPermissions)
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
        Set<String> defaultPermissions = permissionService.getDefaultPermissionsForRole(role);
        user.setPermissions(defaultPermissions);
        return userRepository.save(user);
    }

    public User updateUserPermissions(UUID userId, Set<String> permissions) {
        User user = getUser(userId);
        user.setPermissions(permissions);
        return userRepository.save(user);
    }

    public User assignUserToLocations(UUID userId, Set<UUID> locationIds) {
        User user = getUser(userId);
        user.setAssignedLocationIds(locationIds);
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