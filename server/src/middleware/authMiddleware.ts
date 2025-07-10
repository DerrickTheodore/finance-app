import { AuthenticatedRequest, AuthenticatedUser } from "@myfi/server/types";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { findUserById } from "../repositories/user.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

interface JwtPayload {
  userId: string; // Changed from id to userId to match JWT creation
  email: string; // Added email as it was in JWT creation
}

export const protect = async (
  req: AuthenticatedRequest, // Explicitly use AuthenticatedRequest
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies.token; // Changed from jwt to token to match cookie name

  if (!token) {
    res.status(401).json({ message: "Not authorized" });
    return; // Explicit return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await findUserById({ id: decoded.userId }); // Changed to findUserById
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return; // Explicit return
    }

    req.user = {
      id: user.id.toString(),
      // email: user.email // Optionally add email if AuthenticatedUser includes it
    } as AuthenticatedUser;

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Not authorized" });
    return; // Explicit return
  }
};
