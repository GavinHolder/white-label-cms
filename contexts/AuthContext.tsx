"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// User roles as defined in backend spec
export type UserRole = "super_admin" | "content_editor" | "publisher" | "viewer";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

// Permission types based on backend spec
export type Permission =
  | "view_content"
  | "create_draft"
  | "edit_draft"
  | "delete_draft"
  | "publish_content"
  | "unpublish_content"
  | "upload_media"
  | "delete_media"
  | "manage_navbar"
  | "manage_users"
  | "view_audit_logs";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Permission matrix from backend spec
  const permissions: Record<UserRole, Permission[]> = {
    viewer: ["view_content"],
    content_editor: [
      "view_content",
      "create_draft",
      "edit_draft",
      "upload_media",
      "manage_navbar",
    ],
    publisher: [
      "view_content",
      "create_draft",
      "edit_draft",
      "delete_draft",
      "publish_content",
      "unpublish_content",
      "upload_media",
      "delete_media",
      "manage_navbar",
    ],
    super_admin: [
      "view_content",
      "create_draft",
      "edit_draft",
      "delete_draft",
      "publish_content",
      "unpublish_content",
      "upload_media",
      "delete_media",
      "manage_navbar",
      "manage_users",
      "view_audit_logs",
    ],
  };

  // Check if user has specific permission
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return permissions[user.role].includes(permission);
  };

  // Initialize - check for existing session
  useEffect(() => {
    const initAuth = async () => {
      try {
        // TODO: Replace with actual API call to /api/auth/me
        const token = localStorage.getItem("auth_token");

        if (token) {
          // Simulate API call to validate token and get user
          // In production, this should call: GET /api/auth/me

          // For now, just check if token exists
          // const response = await fetch('/api/auth/me', {
          //   headers: { Authorization: `Bearer ${token}` }
          // });
          // const userData = await response.json();
          // setUser(userData);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("auth_token");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      // TODO: Replace with actual API call to /api/auth/login
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password, rememberMe })
      // });

      // if (!response.ok) {
      //   throw new Error('Login failed');
      // }

      // const { token, user } = await response.json();

      // Store token
      // localStorage.setItem('auth_token', token);
      // if (rememberMe) {
      //   localStorage.setItem('remember_me', 'true');
      // }

      // setUser(user);
      // router.push('/admin/dashboard');

      // Placeholder - simulate successful login
      console.log("Login attempt:", { email, rememberMe });
      throw new Error("Backend API not connected. Please implement authentication endpoints.");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // TODO: Replace with actual API call to /api/auth/logout
      // const token = localStorage.getItem('auth_token');
      // await fetch('/api/auth/logout', {
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      // Clear local storage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("remember_me");

      // Clear user state
      setUser(null);

      // Redirect to login
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if API call fails
      localStorage.removeItem("auth_token");
      localStorage.removeItem("remember_me");
      setUser(null);
      router.push("/admin/login");
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// HOC for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: Permission
) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push("/admin/login");
        } else if (requiredPermission && !hasPermission(requiredPermission)) {
          router.push("/admin/unauthorized");
        }
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <div>Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      return null;
    }

    return <Component {...props} />;
  };
}
