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
  }

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await db
      .insert(users)
      .values({ email, password: hashedPassword })
      .returning();
    logger.info({ user: newUser[0] }, "New user created");

    const token = jwt.sign(
      { userId: newUser[0].id, email: newUser[0].email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(201)
      .json({ token, userId: newUser[0].id, email: newUser[0].email });
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
      return; // Add return to exit after sending response
    }
    const user = userResults[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Email and password do not match." });
      return; // Add return to exit after sending response
    }

    logger.info({ user }, "User logged in");
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, userId: user.id, email: user.email });
  } catch (error) {
    logger.error({ err: error }, "Error during login");
    res.status(500).json({ message: "Internal server error" });
  }
};
