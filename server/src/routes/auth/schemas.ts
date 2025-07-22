import { z } from "zod";

// Define Zod schema for signup request body
export const SignupBody = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

// Define Zod schema for login request body
export const LoginBody = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }), // Or a specific min length if desired
});

// Define Zod schema for user object
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Define Zod schema for signup response body
export const SignupResponseSchema = z.object({
  message: z.literal("Signup successful"),
  token: z.string(),
  user: UserSchema,
});

// Define Zod schema for login response body
export const LoginResponseSchema = z.object({
  message: z.literal("Login successful"),
  token: z.string(),
  user: UserSchema,
});
