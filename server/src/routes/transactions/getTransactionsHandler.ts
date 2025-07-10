import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { plaidItemRepository } from "../../repositories/plaidItem.js";
import { getTransactionsByDateRange } from "../../repositories/transactions/getTransactionsByDateRange.js";
import { GetTransactionsQuerySchema } from "./schemas.js";

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
