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

// Define Zod schema for signup response body
export const SignupResponseSchema = z.object({
  message: z.literal("Signup successful"),
  userId: z.number(),
  email: z.string().email(),
});
