package com.iowaicecreamconcepts.api.auth.security;

import com.iowaicecreamconcepts.api.auth.model.User;
import com.iowaicecreamconcepts.api.auth.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Component
@RequiredArgsConstructor
public class CustomPermissionEvaluator implements PermissionEvaluator {

    private final PermissionService permissionService;

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null || permission == null) {
            return false;
        }

        User user = getCurrentUser();
        if (user == null) {
            return false;
        }

        String[] parts = permission.toString().split(":");
        if (parts.length == 3) {
            // Format: inventory:item:r -> scope=inventory:item, access=r
            String scope = parts[0] + ":" + parts[1];
            String access = parts[2];
            return permissionService.hasPermission(user, scope, access);
        } else if (parts.length == 2) {
            // Format: scope:access
            String scope = parts[0];
            String access = parts[1];
            return permissionService.hasPermission(user, scope, access);
        }

        return false;
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        return hasPermission(authentication, null, permission);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            return (User) auth.getPrincipal();
        }
        return null;
    }
}