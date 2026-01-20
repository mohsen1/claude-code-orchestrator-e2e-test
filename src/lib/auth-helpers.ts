/**
 * Authentication helper utilities
 * Common functions for authentication operations
 */

import { PASSWORD_REQUIREMENTS, type ValidationError } from "./auth-types";

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push({
      field: "password",
      message: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`,
    });
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one uppercase letter",
    });
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one lowercase letter",
    });
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one number",
    });
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one special character",
    });
  }

  return errors;
}

/**
 * Validate signup data
 */
export function validateSignupData(data: {
  email: string;
  password: string;
  name: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate email
  if (!data.email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  // Validate password
  if (!data.password) {
    errors.push({ field: "password", message: "Password is required" });
  } else {
    const passwordErrors = validatePassword(data.password);
    errors.push(...passwordErrors);
  }

  // Validate name
  if (!data.name) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (data.name.trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters long" });
  }

  return errors;
}

/**
 * Validate login data
 */
export function validateLoginData(data: {
  email: string;
  password: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: "email", message: "Invalid email format" });
  }

  if (!data.password) {
    errors.push({ field: "password", message: "Password is required" });
  }

  return errors;
}

/**
 * Generate a random token
 */
export function generateToken(): string {
  return crypto.randomUUID();
}

/**
 * Format error message for display
 */
export function formatAuthErrors(errors: ValidationError[]): string {
  return errors.map((e) => e.message).join(", ");
}

/**
 * Extract initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

/**
 * Check if password is strong enough (returns true/false)
 */
export function isPasswordStrong(password: string): boolean {
  return validatePassword(password).length === 0;
}

/**
 * Calculate password strength score (0-100)
 */
export function getPasswordStrength(password: string): number {
  let score = 0;

  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (/[a-z]/.test(password)) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/\d/.test(password)) score += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;

  return Math.min(score, 100);
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): {
  label: string;
  color: string;
} {
  if (score < 30) return { label: "Weak", color: "text-red-500" };
  if (score < 60) return { label: "Fair", color: "text-yellow-500" };
  if (score < 80) return { label: "Good", color: "text-blue-500" };
  return { label: "Strong", color: "text-green-500" };
}

/**
 * Mask email for privacy (e.g., j***@example.com)
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 2) return email;

  const maskedLocal = local[0] + "*".repeat(local.length - 2) + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
}

/**
 * Generate username from email
 */
export function generateUsername(email: string): string {
  const local = email.split("@")[0];
  return local.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}
