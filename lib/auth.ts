/**
 * Authentication Utilities for JWT-based Authentication
 *
 * Replaces the localStorage-based authentication with secure JWT tokens
 * stored in httpOnly cookies.
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

// Environment variables with fallbacks
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret-change-in-production";
const SESSION_TIMEOUT = process.env.SESSION_TIMEOUT || "14400000"; // 4 hours

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
}

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 * @param password Plain text password to verify
 * @param hash Stored password hash
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate an access token
 * @param payload User information to encode
 * @returns JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "8h", // 8 hours (working day)
  });
}

/**
 * Generate a refresh token (long-lived)
 * @param payload User information to encode
 * @returns JWT refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "30d", // 30 days - long-lived for persistent sessions
  });
}

/**
 * Verify an access token
 * @param token JWT access token
 * @returns Decoded payload if valid, null if invalid
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify a refresh token
 * @param token JWT refresh token
 * @returns Decoded payload if valid, null if invalid
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Decode a token without verification (use for debugging only)
 * @param token JWT token
 * @returns Decoded payload or null
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a user has a specific role or higher
 * @param userRole User's current role
 * @param requiredRole Required role level
 * @returns True if user has required role or higher
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    SUPER_ADMIN: 4,
    PUBLISHER: 3,
    EDITOR: 2,
    VIEWER: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Validate password strength
 * @param password Password to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }

  return null;
}

/**
 * Validate email format
 * @param email Email to validate
 * @returns True if valid email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a random password (for password reset)
 * @param length Password length (default: 12)
 * @returns Random password
 */
export function generateRandomPassword(length: number = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return password;
}
