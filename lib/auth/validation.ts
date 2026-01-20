import { z } from 'zod';

// Password validation
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Signup validation schema
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export type SignupInput = z.infer<typeof signupSchema>;

// Reset password request schema
export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;

// Reset password confirmation schema
export const resetPasswordConfirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
});

export type ResetPasswordConfirmInput = z.infer<typeof resetPasswordConfirmSchema>;

// Update user profile schema
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Validation error helper
export function formatZodError(error: z.ZodError): { [key: string]: string } {
  const errors: { [key: string]: string } = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return errors;
}
