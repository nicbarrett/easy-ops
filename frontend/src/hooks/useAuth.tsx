import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, UserRole } from '../types/api';
import apiClient from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await apiClient.login(credentials);
    
    // The user data is returned in the login response
    const userData: User = {
      id: response.userId,
      name: response.name,
      email: response.email,
      role: response.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // Save user data to localStorage for persistence
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    apiClient.logout();
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isAuthenticated = user !== null;

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Role-based permission helpers
export const ADMIN_ROLES: UserRole[] = ['ADMIN'];
export const PRODUCTION_ROLES: UserRole[] = ['ADMIN', 'PRODUCTION_LEAD'];
export const LEAD_ROLES: UserRole[] = ['ADMIN', 'PRODUCTION_LEAD', 'SHIFT_LEAD'];
export const ALL_ROLES: UserRole[] = ['ADMIN', 'PRODUCTION_LEAD', 'SHIFT_LEAD', 'TEAM_MEMBER'];

export function usePermissions() {
  const { hasAnyRole } = useAuth();

  return {
    canManageUsers: () => hasAnyRole(ADMIN_ROLES),
    canManageInventory: () => hasAnyRole(LEAD_ROLES),
    canManageProduction: () => hasAnyRole(PRODUCTION_ROLES),
    canCreateProductionRequests: () => hasAnyRole(LEAD_ROLES),
    canRecordBatches: () => hasAnyRole(PRODUCTION_ROLES),
    canViewReports: () => hasAnyRole(LEAD_ROLES),
    canTakeInventory: () => hasAnyRole(LEAD_ROLES),
    canViewInventory: () => hasAnyRole(ALL_ROLES),
    canViewProduction: () => hasAnyRole(ALL_ROLES),
  };
}