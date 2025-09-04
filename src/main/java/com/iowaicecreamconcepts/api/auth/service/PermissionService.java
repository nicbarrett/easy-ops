package com.iowaicecreamconcepts.api.auth.service;

import com.iowaicecreamconcepts.api.auth.model.Permission;
import com.iowaicecreamconcepts.api.auth.model.User;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PermissionService {

    public Set<String> getDefaultPermissionsForRole(User.Role role) {
        return switch (role) {
            case ADMIN -> Set.of(
                "admin:user:rw",
                "admin:role:rw", 
                "admin:location:rw",
                "inventory:item:rw",
                "inventory:session:rw",
                "production:batch:rw",
                "production:request:rw"
            );
            case PRODUCTION_LEAD -> Set.of(
                "inventory:item:r",
                "inventory:session:rw",
                "production:batch:rw",
                "production:request:rw"
            );
            case SHIFT_LEAD -> Set.of(
                "inventory:item:r",
                "inventory:session:rw", 
                "production:batch:rw",
                "production:request:r"
            );
            case TEAM_MEMBER -> Set.of(
                "inventory:item:r",
                "inventory:session:r",
                "production:batch:r",
                "production:request:r"
            );
        };
    }

    public boolean hasPermission(User user, String scope, String access) {
        if (user.getPermissions() == null) {
            return false;
        }

        Permission required = Permission.of(scope, access);
        
        return user.getPermissions().stream()
                .map(Permission::parse)
                .anyMatch(userPermission -> userPermission.implies(required));
    }

    public Set<Permission> parsePermissions(Set<String> permissionStrings) {
        return permissionStrings.stream()
                .map(Permission::parse)
                .collect(Collectors.toSet());
    }
}