import { createUser, findUserByEmail } from "@/repositories/users/user.js";
import logger from "@myfi/infra/logger";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { LoggableError } from "src/errors/LoggableError.js";
import { z } from "zod";
import { SignupBody, SignupResponseSchema } from "../schemas.js";

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password }: z.infer<typeof SignupBody> = req.body;

    const existingUser = await findUserByEmail({ email });
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await createUser({ email, password: hashedPassword });
    if (!newUser) {
      res.status(500).json({ message: "Failed to create user" });
      return;
    }

    logger.info(
      { user: { id: newUser.id, email: newUser.email } },
      "New user created"
    );

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    const response = {
      message: "Signup successful" as const,
      userId: newUser.id,
      email: newUser.email,
    };
    SignupResponseSchema.parse(response);
    res.status(201).json(response);
  } catch (error) {
    logger.error(new LoggableError(error, "Error during signup"));
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors.map((e) => ({ path: e.path, message: e.message })),
      });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
