import { db } from "@myfi/infra/database/drizzle/db";
import { users } from "@myfi/infra/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { pino } from "pino";

const logger = pino(
  pino.transport({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
      ignore: "pid,hostname",
    },
  })
);
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in .env file");
}
const SALT_ROUNDS = 10;

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUserResult = await db
      .insert(users)
      .values({ email, password: hashedPassword })
      .returning();

    const user = newUserResult[0];
    logger.info({ user }, "New user created");

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
      path: "/",
    });

    res.status(201).json({
      message: "Signup successful",
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    logger.error({ err: error }, "Error during signup");
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResults.length === 0) {
      res.status(404).json({
        message: "User not found. Please check your email or sign up.",
      });
      return;
    }
    const user = userResults[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Email and password do not match." });
      return;
    }

    logger.info({ user }, "User logged in");
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h", // 1 hour
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Or 'lax'
      maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
      path: "/",
    });

    // Send back user info, excluding the token from the body
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
