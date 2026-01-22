import { z } from "zod";

/**
 * Schema for user registration
 */
export const registerSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z.string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .refine((password) => {
      // At least one letter and one number
      return /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
    }, "Password must contain at least one letter and one number"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Schema for user login
 */
export const loginSchema = z.object({
  email: z.string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schema for updating user profile
 */
export const updateProfileSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),
  email: z.string()
    .email("Invalid email address")
    .toLowerCase()
    .trim()
    .optional(),
  image: z.string()
    .url("Invalid image URL")
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Schema for changing password
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .refine((password) => {
      return /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
    }, "Password must contain at least one letter and one number"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
