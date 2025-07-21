import { LoggableError } from "@/errors/LoggableError.js";
import categoryRepository from "@/repositories/categories/index.js";
import logger from "@myfi/infra/logger";
import type { Category } from "@myfi/infra/types";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (req.user?.id === undefined) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "User ID is required but not found in request" });
      return;
    }

    if (req.db === undefined) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Database connection is required but not found in request",
      });
      return;
    }

    const userId = parseInt(req.user.id);
    const result = await categoryRepository(req.db).getCategoriesByUserId(
      userId
    );
    res.status(StatusCodes.OK).json(result as Category[]);
  } catch (error) {
    logger.error("Error fetching categories:", new LoggableError(error));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching categories", error });
  }
};
