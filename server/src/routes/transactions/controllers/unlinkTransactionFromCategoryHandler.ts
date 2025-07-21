import transactionRepository from "@/repositories/transactions/index.js";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UnlinkTransactionCategorySchema } from "../schemas.js";

export const unlinkTransactionFromCategoryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (
    !req.user?.id ||
    typeof req.user.id !== "string" ||
    req.user.id.trim() === ""
  ) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "User must be authenticated." });
    return;
  }
  if (!req.db) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Database connection not found in request." });
    return;
  }
  try {
    const userId = parseInt(req.user.id.trim(), 10);
    const parsedParams = UnlinkTransactionCategorySchema.parse(req);
    const transactionId = parseInt(parsedParams.params.transactionId);
    const categoryId = parseInt(parsedParams.params.categoryId);
    const success = await transactionRepository(
      req.db
    ).unlinkTransactionFromCategory(userId, transactionId, categoryId);
    if (!success) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Transaction-category link not found or could not be deleted.",
      });
      return;
    }
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    console.error("Error unlinking transaction from category:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error unlinking transaction from category", error });
  }
};
