import { LoggableError } from "@/errors/LoggableError.js";
import categoryRepository from "@/repositories/categories/index.js";
import logger from "@myfi/infra/logger";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CategoryIdParamsSchema } from "../schemas.js";

export const deleteCategory = async (
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
    const userId = parseInt(req.user.id);
    const categoryId = parseInt(parsedParams.params.categoryId);

    const deleted = await categoryRepository(req.db).deleteCategory(
      categoryId,
      userId
    );
    if (!deleted) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Category not found" });
      return;
    }
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    logger.error("Error deleting category:", new LoggableError(error));
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error deleting category", error });
  }
};
