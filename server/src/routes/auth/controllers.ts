import logger from "@myfi/infra/logger";
import { AuthenticatedRequest } from "@myfi/server/types";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../../repositories/user.js";
import { LoginBody, SignupBody, SignupResponseSchema } from "./schemas.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in .env file");
}
const SALT_ROUNDS = 10;

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body as z.infer<typeof SignupBody>;

  try {
    const existingUser = await findUserByEmail({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await createUser({
      email,
      password: hashedPassword,
    });

    if (!newUser || !newUser.id) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    logger.info(
      { user: { id: newUser.id, email: newUser.email } },
      "New user created"
    );

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed from "strict" to "lax"
      maxAge: 60 * 60 * 1000, // 1 hour
      path: "/",
    });

    // Validate the response before sending
    const response = {
      message: "Signup successful" as const,
      userId: newUser.id,
      email: newUser.email,
    };
    SignupResponseSchema.parse(response); // Throws if invalid

    res.status(201).json(response);
  } catch (error) {
    logger.error({ err: error }, "Error during signup");
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as z.infer<typeof LoginBody>;

  try {
    const user = await findUserByEmail({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please check your email or sign up.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Email and password do not match." });
    }

    logger.info({ user: { id: user.id, email: user.email } }, "User logged in");
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed from "strict" to "lax"
      maxAge: 60 * 60 * 1000, // 1 hour
      path: "/",
    });

    res.status(200).json({
      message: "Login successful",
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    logger.error({ err: error }, "Error during login");
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });
  res.status(200).json({ message: "Logout successful" });
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      // This should ideally be caught by protect middleware, but good to have a check
      return res
        .status(401)
        .json({ message: "Not authorized, user ID missing from token" });
    }

    const userId = req.user.id;
    const currentUser = await findUserById({ id: userId });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = currentUser;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    logger.error({ err: error }, "Error in getMe controller");
    // Instead of res.status(500).json(...), pass error to Express error handler
    // This is generally better practice for unhandled/unexpected errors in controllers
    next(error);
  }
};
