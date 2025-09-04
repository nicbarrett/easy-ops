package com.iowaicecreamconcepts.api.auth.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permission {
    private String scope;   // "admin:user", "inventory:item", "production:batch", etc.
    private String access;  // "r" for read, "rw" for read-write

    public static Permission of(String scope, String access) {
        return new Permission(scope, access);
    }

    public String toString() {
        return scope + ":" + access;
    }

    public static Permission parse(String permissionString) {
        String[] parts = permissionString.split(":");
        if (parts.length == 3) {
            return new Permission(parts[0] + ":" + parts[1], parts[2]);
        }
        throw new IllegalArgumentException("Invalid permission format: " + permissionString);
    }

    public boolean implies(Permission other) {
        if (!this.scope.equals(other.scope)) {
            return false;
        }
        return "rw".equals(this.access) || this.access.equals(other.access);
    }
}