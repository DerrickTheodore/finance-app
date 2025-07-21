import transactionRepository from "@/repositories/transactions/index.js";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { LinkTransactionCategorySchema } from "../schemas.js";

export const linkTransactionToCategoryHandler = async (
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
    const parsed = LinkTransactionCategorySchema.parse(req);

    console.log(`[linkTransactionToCategoryHandler] Request data:`, {
      userId,
      transactionId: parsed.params.transactionId,
      categoryId: parsed.body.categoryId,
      rawParams: req.params,
      rawBody: req.body,
    });

    const linkedRelation = await transactionRepository(
      req.db
    ).linkTransactionToCategory(
      userId,
      parseInt(parsed.params.transactionId),
      parsed.body.categoryId
    );

    if (!linkedRelation) {
      console.log(
        `[linkTransactionToCategoryHandler] Failed to link - linkedRelation is null`
      );
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Transaction or Category not found, or link already exists.",
      });
      return;
    }

    res.status(StatusCodes.OK).json({ linkedRelation });
  } catch (error) {
    console.error("Error linking transaction to category:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error linking transaction to category", error });
  }
};
