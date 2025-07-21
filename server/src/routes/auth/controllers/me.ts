import { LoggableError } from "@/errors/LoggableError.js";
import { findUserById } from "@/repositories/users/user.js";
import logger from "@myfi/infra/logger";
import { NextFunction, Request, Response } from "express";

export const me = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    if (!req.user || !req.user.id) {
      res
        .status(401)
        .json({ message: "Not authorized, user ID missing from token" });
      return;
    }

    const userId = req.user.id;
    const currentUser = await findUserById({ id: userId });
    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { password, ...userWithoutPassword } = currentUser;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    logger.error(new LoggableError(error, "Error fetching user details"));
    res.status(500).json({ message: "Internal server error" });
  }
};
