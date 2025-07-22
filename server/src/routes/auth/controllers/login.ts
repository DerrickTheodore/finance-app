import { LoggableError } from "@/errors/index.js";
import { findUserByEmail } from "@/repositories/users/user.js";
import logger from "@myfi/infra/logger";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { LoginBody, LoginResponseSchema } from "../schemas.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const { email, password }: z.infer<typeof LoginBody> = req.body;

  try {
    const user = await findUserByEmail({ email });
    if (!user) {
      res.status(404).json({
        message: "User not found. Please check your email or sign up.",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Email and password do not match." });
      return;
    }

    logger.info({ user: { id: user.id, email: user.email } }, "User logged in");

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );

    // Set token in cookie
    res.cookie("token", token, {
      /**
       * TODO: Reanable httpOnly for security
       * This is commented out for mobile clients that need to access the token directly
       * but should be enabled in production for web clients
       */
      // httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    const response = {
      message: "Login successful" as const,
      token: token, // Include token for mobile clients
      user: {
        id: user.id,
        email: user.email,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      },
    };
    LoginResponseSchema.parse(response);
    res.status(200).json(response);
  } catch (error) {
    logger.error(new LoggableError(error, "Error during login"));

    res.status(500).json({ message: "Internal server error" });
  }
};
