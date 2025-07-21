import { userRepository } from "@/repositories/users/index.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

export const authorize = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies.token; // Changed from jwt to token to match cookie name

  if (!token) {
    res.status(401).json({ message: "Not authorized" });
    return; // Explicit return
  }

  if (req.db === undefined) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Database connection is required but not found in request",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await userRepository(req.db).findUserById({
      id: decoded.userId,
    }); // Using the direct function
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return; // Explicit return
    }

    req.user = {
      id: user.id.toString(),
      // email: user.email // Optionally add email if AuthenticatedUser includes it
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Not authorized" });
    return; // Explicit return
  }
};

export default authorize;
