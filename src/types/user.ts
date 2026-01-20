import { z } from 'zod';

// Database Model Schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  image: z.string().url().nullable(),
  hashedPassword: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Create User Schema (for registration)
export const CreateUserSchema = UserSchema.pick({
  name: true,
  email: true,
}).extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Update User Schema
export const UpdateUserSchema = UserSchema.pick({
  name: true,
  image: true,
}).partial();

// Login Schema
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// TypeScript Types
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

// User Response Type (without sensitive data)
export type UserResponse = Omit<User, 'hashedPassword'>;
