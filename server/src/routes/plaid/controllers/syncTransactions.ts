import plaidItemRepository from "@/repositories/plaidItems/index.js";
import transactionRepository from "@/repositories/transactions/index.js";
import {
  getTransactions as getTransactionsService,
  isSdkPlaidError,
} from "@myfi/libs/plaid";
import { Request, Response } from "express";

export const syncTransactions = async (req: Request, res: Response) => {
  if (
    !req.user?.id ||
    typeof req.user.id !== "string" ||
    req.user.id.trim() === ""
  ) {
    return res.status(401).json({ message: "User must be authenticated." });
  }
  if (!req.db) {
    return res
      .status(500)
      .json({ message: "Database connection not found in request." });
  }
  const userId = req.user.id.trim();
  const { plaidItemId } = req.params;
  if (!plaidItemId) {
    return res.status(400).json({ message: "Missing plaidItemId" });
  }
  try {
    const plaidItem = await plaidItemRepository(
      req.db
    ).getPlaidItemByPlaidItemId(plaidItemId, parseInt(userId, 10));
    if (!plaidItem) {
      return res.status(404).json({ message: "Plaid item not found." });
    }
    if (plaidItem.userId !== parseInt(userId, 10)) {
      return res
        .status(403)
        .json({ message: "User not authorized for this Plaid item." });
    }
    const { transactions: fetchedTransactions } = await getTransactionsService({
      accessToken: plaidItem.accessToken,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      count: 100,
      offset: 0,
    });
    if (fetchedTransactions.length > 0 && plaidItem.id !== undefined) {
      await transactionRepository(req.db).upsertTransactions(
        parseInt(userId, 10),
        plaidItem.id!,
        fetchedTransactions
      );
    }
    res.json({ message: "Transactions synced successfully." });
  } catch (e) {
    console.error("Error syncing transactions:", e);
    if (isSdkPlaidError(e)) {
      const errorDetails = {
        error_type: e.error_type,
        error_code: e.error_code,
        error_message: e.error_message,
        display_message: e.display_message,
        request_id: e.request_id,
      };
      return res
        .status(500)
        .json({ message: "Error syncing transactions", error: errorDetails });
    }
    res.status(500).json({ message: "Error syncing transactions", error: e });
  }
};
