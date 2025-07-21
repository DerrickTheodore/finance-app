import { LoggableError } from "@/errors/LoggableError.js";
import categoryRepository from "@/repositories/categories/index.js";
import logger from "@myfi/infra/logger";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CreateCategorySchema } from "../schemas.js";

export const createCategory = async (
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

    const {
      body: { name, color, icon },
    } = CreateCategorySchema.parse(req);
    const category = await categoryRepository(req.db).createCategory({
      userId: parseInt(req.user.id),
      name,
      color,
      icon,
    });

    res.status(StatusCodes.CREATED).json(category);
  } catch (error) {
    logger.error("Error creating category:", new LoggableError(error));
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint failed")
    ) {
      res.status(StatusCodes.CONFLICT).json({
        message: "Category with this name already exists for the user.",
      });
      return;
    }
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Error creating category", error });
  }
};
