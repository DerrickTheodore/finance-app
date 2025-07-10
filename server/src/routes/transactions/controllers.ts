import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { transactionRepository } from "../../repositories/index.js";
import { plaidItemRepository } from "../../repositories/plaidItem.js";
import { getTransactionsByDateRange } from "../../repositories/transactions/getTransactionsByDateRange.js";
import {
  GetTransactionsQuerySchema,
  LinkTransactionCategorySchema,
  UnlinkTransactionCategorySchema,
} from "./schemas.js";

export const getTransactionsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // @ts-ignore
    const userId = parseInt(req.user?.id || "1");
    const { plaidItemId, account_ids, startDate, endDate } =
      GetTransactionsQuerySchema.parse(req.query);

    const plaidItem = await plaidItemRepository(
      req.db
    ).getPlaidItemByPlaidItemId(plaidItemId, userId);

    if (!plaidItem || !plaidItem.id) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Plaid item not found" });
      return;
    }

    const transactions = await getTransactionsByDateRange(
      userId,
      plaidItem.id, // Now safe to access
      account_ids,
      startDate,
      endDate
    );

    res.status(StatusCodes.OK).json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Error fetching transactions", error });
  }
};

export const linkTransactionToCategoryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // @ts-ignore // TODO: Fix this once auth is in place
    const userId = parseInt(req.user?.id || "1");
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
      parseInt(parsed.params.transactionId), // transactionId from params
      parsed.body.categoryId // categoryId from body
    );

    if (!linkedRelation) {
      console.log(
        `[linkTransactionToCategoryHandler] Failed to link - linkedRelation is null`
      );
      res // Added return
        .status(StatusCodes.NOT_FOUND)
        .json({
          message: "Transaction or Category not found, or link already exists.",
        });
      return; // Added return
    }

    console.log(
      `[linkTransactionToCategoryHandler] Successfully linked:`,
      linkedRelation
    );
    res.status(StatusCodes.CREATED).json(linkedRelation);
  } catch (error) {
    console.error("Error linking transaction to category:", error);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Error linking transaction to category", error });
  }
};

export const unlinkTransactionFromCategoryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // @ts-ignore // TODO: Fix this once auth is in place
    const userId = parseInt(req.user?.id || "1");
    const parsedParams = UnlinkTransactionCategorySchema.parse(req); // Use schema for params

    const transactionId = parseInt(parsedParams.params.transactionId);
    const categoryId = parseInt(parsedParams.params.categoryId);

    // No need for isNaN checks as Zod schema handles numeric conversion and validation

    const success = await transactionRepository(
      req.db
    ).unlinkTransactionFromCategory(userId, transactionId, categoryId);

    if (!success) {
      res // Added return
        .status(StatusCodes.NOT_FOUND)
        .json({
          message:
            "Transaction-category link not found or could not be deleted.",
        });
      return; // Added return
    }

    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    console.error("Error unlinking transaction from category:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error unlinking transaction from category", error });
  }
};
