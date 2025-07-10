import { db } from "@myfi/infra/database/drizzle/db";
import { NextFunction, Request, Response } from "express";

/**
 * Middleware to attach the DrizzleDB instance to the Express request object.
 */
export const attachDb = (req: Request, _res: Response, next: NextFunction) => {
  req.db = db;
  next();
};
