import plaidItemRepository from "@/repositories/plaidItems/index.js";
import transactionRepository from "@/repositories/transactions/index.js";
import { isSdkPlaidError } from "@myfi/libs/plaid";
import { NextFunction, Request, Response } from "express";

export const getTransactions = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (
    !req.user?.id ||
    typeof req.user.id !== "string" ||
    req.user.id.trim() === ""
  ) {
    res.status(401).json({ message: "User must be authenticated." });
    return;
  }
  if (!req.db) {
    res
      .status(500)
      .json({ message: "Database connection not found in request." });
    return;
  }
  const userId = req.user.id.trim();
  const {
    plaidItemId,
    startDate,
    endDate,
    account_ids,
    count = 100,
    offset = 0,
  } = req.query;
  try {
    if (!plaidItemId) {
      res.status(400).json({ message: "plaidItemId is required" });
      return;
    }
    const plaidItem = await plaidItemRepository(
      req.db
    ).getPlaidItemByPlaidItemId(plaidItemId as string, parseInt(userId, 10));
    if (!plaidItem) {
      res.status(404).json({ message: "Plaid item not found for user" });
      return;
    }
    const page = Math.floor(Number(offset) / Number(count)) + 1;
    const pageSize = Number(count);
    const result = await transactionRepository(req.db).getTransactions(
      parseInt(userId, 10),
      plaidItem.id!,
      { page, pageSize }
    );
    let filteredTransactions = result.data;
    if (account_ids) {
      const accountIdsArray = Array.isArray(account_ids)
        ? (account_ids as string[])
        : [account_ids as string];
      filteredTransactions = result.data.filter((tx) =>
        accountIdsArray.includes(tx.plaidAccountId)
      );
    }
    if (startDate || endDate) {
      filteredTransactions = filteredTransactions.filter((tx) => {
        const txDate = new Date(tx.date);
        if (startDate && txDate < new Date(startDate as string)) return false;
        if (endDate && txDate > new Date(endDate as string)) return false;
        return true;
      });
    }
    res.status(200).json({
      ...result,
      data: filteredTransactions,
    });
  } catch (e) {
    console.error("Error getting transactions:", e);
    if (isSdkPlaidError(e)) {
      res.status(500).json({
        error_type: e.error_type,
        error_code: e.error_code,
        error_message: e.error_message,
        display_message: e.display_message,
        request_id: e.request_id,
      });
      return;
    }
    res.status(500).json({ message: "Error getting transactions" });
  }
};
