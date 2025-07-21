import plaidItemRepository from "@/repositories/plaidItems/index.js";
import transactionRepository from "@/repositories/transactions/index.js";
import type { NewPlaidItemData } from "@myfi/infra/database/drizzle/schema/types.js";
import {
  exchangePublicToken as exchangePublicTokenService,
  getTransactions,
  isSdkPlaidError,
} from "@myfi/libs/plaid";
import { NextFunction, Request, Response } from "express";

export const exchangePublicToken = async (
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
  const { public_token, metadata } = req.body;
  const userId = req.user.id.trim();
  const institutionName = metadata?.institution?.name;
  const accounts = metadata?.accounts;

  if (!public_token) {
    res.status(400).json({ message: "Missing public_token in request body" });
    return;
  }
  if (!institutionName) {
    res
      .status(400)
      .json({ message: "Missing institution name in request metadata" });
    return;
  }
  if (!accounts || accounts.length === 0) {
    res.status(400).json({ message: "Missing accounts in request metadata" });
    return;
  }

  try {
    const exchangeResponse = await exchangePublicTokenService(public_token);
    const { accessToken, itemId } = exchangeResponse;
    const newPlaidItem: NewPlaidItemData = {
      plaidItemId: itemId,
      userId: parseInt(userId, 10),
      plaidAccessToken: accessToken,
      plaidInstitutionId: exchangeResponse.institutionId,
      plaidInstitutionName: institutionName,
      accounts: accounts,
    };
    const createdPlaidItem = await plaidItemRepository(req.db).createPlaidItem(
      newPlaidItem
    );
    const { transactions: fetchedTransactions } = await getTransactions({
      accessToken: accessToken,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      count: 100,
      offset: 0,
    });
    if (fetchedTransactions.length > 0 && createdPlaidItem.id !== undefined) {
      await transactionRepository(req.db).upsertTransactions(
        parseInt(userId, 10),
        createdPlaidItem.id!,
        fetchedTransactions
      );
    }
    res.json({
      message:
        "Plaid item linked successfully and initial transactions fetched.",
      plaidItemId: itemId,
    });
  } catch (e: unknown) {
    console.error("Error exchanging public token:", e);
    if (isSdkPlaidError(e)) {
      const errorDetails = {
        error_type: e.error_type,
        error_code: e.error_code,
        error_message: e.error_message,
        display_message: e.display_message,
        request_id: e.request_id,
        status_code: e.status,
      };
      res.status(500).json({
        message: "Error exchanging public token",
        error: errorDetails,
      });
      return;
    }
    res
      .status(500)
      .json({ message: "Error exchanging public token", error: e });
  }
};
