package com.iowaicecreamconcepts.api.auth.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    @NotBlank
    @Column(nullable = false)
    private String firstName;

    @NotBlank
    @Column(nullable = false)
    private String lastName;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @NotBlank
    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_permissions")
    @Column(name = "permission")
    private Set<String> permissions;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_locations")
    @Column(name = "location_id")
    private Set<UUID> assignedLocationIds;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    @Override
    public String toString() {
        return email;
    }

    public enum Role {
        ADMIN,          // Owner/Admin: all permissions, settings, user management
        PRODUCTION_LEAD, // Production Lead: create/approve production requests, record batches, manage recipes
        SHIFT_LEAD,     // Shift Lead: take inventory, view/resolve low-stock alerts, close production tasks
        TEAM_MEMBER     // Team Member (Scooper): view tasks, log counts on assigned items
    }
}