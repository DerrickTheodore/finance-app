import plaidItemRepository from "@/repositories/plaidItems/index.js";
import transactionRepository from "@/repositories/transactions/index.js";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { GetTransactionsQuerySchema } from "../schemas.js";

export const getTransactionsHandler = async (
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

    const transactions = await transactionRepository(
      req.db
    ).getTransactionsByDateRange(
      userId,
      plaidItem.id,
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
