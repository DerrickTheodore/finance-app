import { LoggableError } from "@/errors/LoggableError.js";
import categoryRepository from "@/repositories/categories/index.js";
import logger from "@myfi/infra/logger";
import type { Category } from "@myfi/infra/types";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CategoryIdParamsSchema, UpdateCategorySchema } from "../schemas.js";

export const updateCategory = async (
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

    const parsedParams = CategoryIdParamsSchema.parse(req);
    const parsedBody = UpdateCategorySchema.parse(req.body);
    const userId = parseInt(req.user.id);
    const categoryId = parseInt(parsedParams.params.categoryId);

    const updatedCategory = await categoryRepository(req.db).updateCategory(
      categoryId,
      userId,
      parsedBody.body
    );
    if (!updatedCategory) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Category not found" });
      return;
    }
    res.status(StatusCodes.OK).json(updatedCategory as Category);
  } catch (error) {
    logger.error("Error updating category:", new LoggableError(error));
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
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error updating category", error });
  }
};
