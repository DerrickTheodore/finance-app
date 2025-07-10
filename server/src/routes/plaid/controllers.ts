import {
  createLinkToken as createLinkTokenService,
  exchangePublicToken as exchangePublicTokenService,
  getTransactions as getTransactionsService,
  isSdkPlaidError,
  PlaidCreateLinkTokenResponse,
  PlaidProducts, // Ensure PlaidProducts is imported
  removeItem as removePlaidItem,
} from "@myfi/libs/plaid";
import { Request, Response } from "express";
import { AppRouteAuthenticatedController } from "types.js";
import type { NewPlaidItemData } from "../../../../infra/database/drizzle/schema/types.js";
import { PlaidItem } from "../../../../infra/types.js";
import { plaidItemRepository } from "../../repositories/plaidItem.js";
import { transactionRepository } from "../../repositories/transactionRepository.js";

// Controller for POST /api/plaid/create_link_token
export const createLinkToken = async (req: Request, res: Response) => {
  try {
    // @ts-ignore // TODO: Fix this once auth is in place
    const userId = req.user?.id || "1"; // TEMP

    // Validate userId is not empty
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      return res.status(400).json({
        error: "Invalid user ID. User must be authenticated.",
      });
    }

    const createLinkTokenResponse: PlaidCreateLinkTokenResponse =
      await createLinkTokenService({
        userId: userId.trim(),
        products: [PlaidProducts.Transactions], // Default to transactions product
      });
    res.json(createLinkTokenResponse);
  } catch (e: unknown) {
    console.error("Error creating link token:", e);
    if (isSdkPlaidError(e)) {
      // Handle Plaid-specific errors
      const errorDetails = {
        error_type: e.error_type,
        error_code: e.error_code,
        error_message: e.error_message,
        display_message: e.display_message,
        request_id: e.request_id,
        status_code: e.status,
      };
      return res
        .status(500)
        .json({ message: "Error creating link token", error: errorDetails });
    }
    // Handle other errors
    res.status(500).json({ message: "Error creating link token", error: e });
  }
};

export const exchangePublicToken = async (req: Request, res: Response) => {
  // Destructure according to the Zod schema (ExchangePublicTokenBody)
  const { public_token, metadata } = req.body;
  // @ts-ignore // TODO: Fix this once auth is in place
  const userId = req.user?.id || "1"; // TEMP

  // Extract institutionName and accounts from metadata
  const institutionName = metadata?.institution?.name;
  const accounts = metadata?.accounts;

  if (!public_token) {
    return res.status(400).json({
      message: "Missing public_token in request body",
    });
  }

  // It's good practice to ensure institutionName and accounts are present if your logic depends on them
  // For example, if Plaid Link might not always return them or they are critical.
  if (!institutionName) {
    return res.status(400).json({
      message: "Missing institution name in request metadata",
    });
  }

  if (!accounts || accounts.length === 0) {
    return res.status(400).json({
      message: "Missing accounts in request metadata",
    });
  }

  try {
    const exchangeResponse = await exchangePublicTokenService(public_token);
    const { accessToken, itemId } = exchangeResponse;

    const newPlaidItem: NewPlaidItemData = {
      plaidItemId: itemId,
      userId: parseInt(userId, 10), // Convert string to number
      plaidAccessToken: accessToken, // Use plaidAccessToken for the repository
      plaidInstitutionId: exchangeResponse.institutionId,
      plaidInstitutionName: institutionName,
      accounts: accounts, // Pass the accounts from request
    };

    const createdPlaidItem = await plaidItemRepository(req.db).createPlaidItem(
      newPlaidItem
    );

    // Fetch initial transactions after linking item
    // TODO: Consider moving this to a webhook or background job for better UX
    const { transactions: fetchedTransactions } = await getTransactionsService({
      accessToken: accessToken,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days ago
      endDate: new Date().toISOString().split("T")[0], // today
      count: 100,
      offset: 0,
    });

    if (fetchedTransactions.length > 0 && createdPlaidItem.id !== undefined) {
      // Pass the raw Plaid transactions to the repository which expects PlaidTransactionForDb[]
      await transactionRepository(req.db).upsertTransactions(
        parseInt(userId, 10),
        createdPlaidItem.id!, // Use non-null assertion after checking undefined
        fetchedTransactions // Pass raw transactions, repository will handle mapping
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
      return res.status(500).json({
        message: "Error exchanging public token",
        error: errorDetails,
      });
    }
    res
      .status(500)
      .json({ message: "Error exchanging public token", error: e });
  }
};

// Controller for GET /api/plaid/items
export const getPlaidItems = async (req: Request, res: Response) => {
  // @ts-ignore // TODO: Fix this once auth is in place
  const userId = req.user?.id || "1"; // TEMP
  try {
    const plaidItems = await plaidItemRepository(req.db).getPlaidItemsByUserId(
      parseInt(userId, 10)
    );
    return res.status(200).json({ plaidItems });
  } catch (e) {
    console.error("Error getting Plaid items:", e);
    if (isSdkPlaidError(e)) {
      return res.status(500).json({
        error_type: e.error_type,
        error_code: e.error_code,
        error_message: e.error_message,
        display_message: e.display_message,
        request_id: e.request_id,
      });
    }
    return res.status(500).json({ message: "Error getting Plaid items" });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  // @ts-ignore // TODO: Fix this once auth is in place
  const userId = req.user?.id || "1"; // TEMP
  const {
    plaidItemId,
    startDate,
    endDate,
    account_ids,
    count = 100,
    offset = 0,
  } = req.query;

  try {
    // Validate required parameters
    if (!plaidItemId) {
      return res.status(400).json({ message: "plaidItemId is required" });
    }

    // First, get the Plaid item from the database to get its internal ID
    const plaidItem = await plaidItemRepository(
      req.db
    ).getPlaidItemByPlaidItemId(plaidItemId as string, parseInt(userId, 10));

    if (!plaidItem) {
      return res.status(404).json({ message: "Plaid item not found for user" });
    }

    // Calculate pagination
    const page = Math.floor(Number(offset) / Number(count)) + 1;
    const pageSize = Number(count);

    // Get transactions from database
    const result = await transactionRepository(req.db).getTransactions(
      parseInt(userId, 10),
      plaidItem.id!, // Use the database ID
      {
        page,
        pageSize,
      }
    );

    // Filter by account IDs if provided (client-side filtering for now)
    let filteredTransactions = result.data;
    if (account_ids) {
      const accountIdsArray = Array.isArray(account_ids)
        ? (account_ids as string[])
        : [account_ids as string];
      filteredTransactions = result.data.filter((tx) =>
        accountIdsArray.includes(tx.plaidAccountId)
      );
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      const beforeDateFilter = filteredTransactions.length;
      filteredTransactions = filteredTransactions.filter((tx) => {
        const txDate = new Date(tx.date);
        if (startDate && txDate < new Date(startDate as string)) return false;
        if (endDate && txDate > new Date(endDate as string)) return false;
        return true;
      });
    }

    res.json(filteredTransactions); // Return just the transactions array
  } catch (e: unknown) {
    console.error("Error fetching transactions:", e);
    if (isSdkPlaidError(e)) {
      const errorDetails = {
        error_type: e.error_type,
        error_code: e.error_code,
        error_message: e.error_message,
        display_message: e.display_message,
        request_id: e.request_id,
        status_code: e.status,
      };
      return res
        .status(500)
        .json({ message: "Error fetching transactions", error: errorDetails });
    }
    res.status(500).json({ message: "Error fetching transactions", error: e });
  }
};

export const syncTransactions = async (req: Request, res: Response) => {
  // @ts-ignore // TODO: Fix this once auth is in place
  const userId = req.user?.id || "1"; // TEMP
  const { plaidItemId } = req.params; // Or from req.body, depending on your route design

  if (!plaidItemId) {
    return res.status(400).json({ message: "Missing plaidItemId" });
  }

  try {
    const plaidItem = await plaidItemRepository(
      req.db
    ).getPlaidItemByPlaidItemId(plaidItemId, parseInt(userId, 10)); // Fix: Convert userId to number

    if (!plaidItem) {
      return res.status(404).json({ message: "Plaid item not found." });
    }
    if (plaidItem.userId !== parseInt(userId, 10)) {
      // Fix: Convert userId to number for comparison
      return res
        .status(403)
        .json({ message: "User not authorized for this Plaid item." });
    }

    const { transactions: fetchedTransactions } = await getTransactionsService({
      accessToken: plaidItem.accessToken,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days ago
      endDate: new Date().toISOString().split("T")[0], // today
      count: 100,
      offset: 0,
    });

    if (fetchedTransactions.length > 0 && plaidItem.id !== undefined) {
      // Pass the raw Plaid transactions to the repository which expects PlaidTransactionForDb[]
      await transactionRepository(req.db).upsertTransactions(
        parseInt(userId, 10), // Convert userId to number
        plaidItem.id!, // Use non-null assertion after checking undefined
        fetchedTransactions // Pass raw transactions, repository will handle mapping
      );
      // Optionally, update plaidItem.lastSynced here
    }

    res.json({
      message: "Transactions synced successfully.",
      count: fetchedTransactions.length,
    });
  } catch (e: unknown) {
    console.error("Error syncing transactions:", e);
    if (isSdkPlaidError(e)) {
      const errorDetails = {
        error_type: e.error_type,
        error_code: e.error_code,
        error_message: e.error_message,
        display_message: e.display_message,
        request_id: e.request_id,
        status_code: e.status,
      };
      return res
        .status(500)
        .json({ message: "Error syncing transactions", error: errorDetails });
    }
    res.status(500).json({ message: "Error syncing transactions", error: e });
  }
};

export const removeItem = async (req: Request, res: Response) => {
  const { itemId } = req.params;
  // @ts-ignore // TODO: Fix this once auth is in place
  const userId = req.user?.id || "1"; // TEMP

  if (!itemId) {
    return res
      .status(400)
      .json({ message: "Missing itemId in request params" });
  }

  try {
    const plaidItem = await plaidItemRepository(
      req.db
    ).getPlaidItemByPlaidItemId(itemId, parseInt(userId, 10)); // Fix: Convert userId to number
    if (!plaidItem || !plaidItem.id) {
      return res.status(404).json({ message: "Plaid item not found" });
    }
    if (plaidItem.userId !== parseInt(userId, 10)) {
      // Fix: Convert userId to number
      return res
        .status(403)
        .json({ message: "User not authorized to remove this Plaid item." });
    }

    // Call Plaid to invalidate the access token
    await removePlaidItem(plaidItem.accessToken); // Fix: Use accessToken not plaidAccessToken

    // TODO: Implement deleteTransactionsByPlaidItemId in transactionRepository.ts
    // This function should delete all transactions associated with the plaidItemId.
    // await deleteTransactionsByPlaidItemId(req.db, itemId);

    // Delete the Plaid item from your database
    await plaidItemRepository(req.db).deletePlaidItem(
      plaidItem.id,
      parseInt(userId, 10)
    ); // Fix: Convert userId to number

    res.json({ message: "Plaid item removed successfully" });
  } catch (e: unknown) {
    console.error("Error removing Plaid item:", e);
    if (isSdkPlaidError(e)) {
      const errorDetails = {
        error_type: e.error_type,
        error_code: e.error_code,
        error_message: e.error_message,
        display_message: e.display_message,
        request_id: e.request_id,
        status_code: e.status,
      };
      return res
        .status(500)
        .json({ message: "Error removing Plaid item", error: errorDetails });
    }
    res.status(500).json({ message: "Error removing Plaid item", error: e });
  }
};

// Controller for DELETE /api/plaid/items/:plaidItemId
export const deletePlaidItemController = async (
  req: AppRouteAuthenticatedController<{ plaidItemId: string }>,
  res: Response
) => {
  const { plaidItemId } = req.params;
  const { id: userIdString } = req.user;
  const userId = parseInt(userIdString, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  console.log(
    `[Controller - deletePlaidItemController] Attempting to delete item ${plaidItemId} for user ${userId}`
  );
  let itemToDelete: PlaidItem | null = null;

  try {
    itemToDelete = await plaidItemRepository(req.db).getPlaidItemByPlaidItemId(
      plaidItemId,
      userId
    );
    if (!itemToDelete || !itemToDelete.id) {
      console.log(
        `[Controller - deletePlaidItemController] Item ${plaidItemId} not found for user ${userId}`
      );
      return res.status(404).json({ message: "Plaid item not found." });
    }

    await removePlaidItem(itemToDelete.accessToken); // Fix: Use accessToken not plaidAccessToken
    console.log(
      `[Controller - deletePlaidItemController] Successfully called Plaid to remove item ${plaidItemId}`
    );

    // TODO: Implement transactionRepository(req.db).deleteTransactionsByPlaidItemId(itemToDelete.id, userId);
    console.warn(
      `[Controller - deletePlaidItemController] Transaction deletion for Plaid item ID ${itemToDelete.id} (local DB ID) is not yet implemented.`
    );

    const deletedFromDb = await plaidItemRepository(req.db).deletePlaidItem(
      itemToDelete.id,
      userId
    );
    if (!deletedFromDb) {
      console.error(
        `[Controller - deletePlaidItemController] Failed to delete item ${plaidItemId} from database for user ${userId} after Plaid removal.`
      );
      return res.status(500).json({
        error_code: "DB_DELETE_FAILED",
        message:
          "Item removed from Plaid but failed to remove from local records. Please contact support.",
      });
    }

    console.log(
      `[Controller - deletePlaidItemController] Successfully deleted item ${plaidItemId} from database for user ${userId}`
    );
    res.status(200).json({ message: "Linked account removed successfully." });
  } catch (e: unknown) {
    console.error(
      `[Controller - deletePlaidItemController] Error removing item ${plaidItemId} for user ${userId}:`,
      e
    );
    if (isSdkPlaidError(e)) {
      res.status(e.status || 500).json({
        error_type: e.error_type,
        error_code: e.error_code,
        error_message: e.error_message,
        display_message:
          e.display_message ||
          "An error occurred with Plaid while removing the account.",
        request_id: e.request_id,
      });
    } else if (e instanceof Error) {
      res.status(500).json({
        error_code: "INTERNAL_SERVER_ERROR",
        error_message: e.message,
        display_message:
          "Failed to remove linked account due to a server error.",
      });
    } else {
      res.status(500).json({
        error_code: "UNKNOWN_ERROR",
        error_message:
          "Failed to remove linked account due to an unexpected error.",
        display_message:
          "Failed to remove linked account due to an unexpected error.",
      });
    }
  }
};

// Controller for DELETE /api/plaid/item/:plaidItemId/transactions
export const deletePlaidItemAndTransactions = async (
  req: AppRouteAuthenticatedController<{ plaidItemId: string }>,
  res: Response
) => {
  const { plaidItemId } = req.params;
  const { id: userIdString } = req.user;
  const userId = parseInt(userIdString, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }

  console.log(
    `[Controller - deletePlaidItemAndTransactions] Attempting to delete item ${plaidItemId} and its transactions for user ${userId}`
  );
  let itemToDelete: PlaidItem | null = null;

  try {
    itemToDelete = await plaidItemRepository(req.db).getPlaidItemByPlaidItemId(
      plaidItemId,
      userId
    );
    if (!itemToDelete || !itemToDelete.id) {
      return res.status(404).json({ message: "Plaid item not found." });
    }

    // TODO: Implement and call transactionRepository(req.db).deleteTransactionsByPlaidItemId(itemToDelete.id, userId);
    console.warn(
      `[Controller - deletePlaidItemAndTransactions] Transaction deletion for Plaid item ID ${itemToDelete.id} (local DB ID) is not yet implemented.`
    );

    await removePlaidItem(itemToDelete.accessToken); // Fix: Use accessToken not plaidAccessToken
    console.log(
      `[Controller - deletePlaidItemAndTransactions] Successfully called Plaid to remove item ${plaidItemId}`
    );

    const deletedFromDb = await plaidItemRepository(req.db).deletePlaidItem(
      itemToDelete.id,
      userId
    );
    if (!deletedFromDb) {
      console.error(
        `[Controller - deletePlaidItemAndTransactions] Failed to delete item ${plaidItemId} from database after Plaid removal and (simulated) transaction deletion for user ${userId}.`
      );
      return res.status(500).json({
        error_code: "DB_DELETE_FAILED_POST_PLAID_REMOVAL",
        message:
          "Item removed from Plaid and transactions (simulated) cleared, but failed to remove local item record. Please contact support.",
      });
    }

    console.log(
      `[Controller - deletePlaidItemAndTransactions] Successfully deleted item ${plaidItemId} and (simulated) its transactions for user ${userId}`
    );
    res.status(200).json({
      message: `Successfully removed Plaid item ${plaidItemId} and associated data.`,
      plaidItemId: plaidItemId,
    });
  } catch (e: unknown) {
    console.error(
      `[Controller - deletePlaidItemAndTransactions] Error removing item ${plaidItemId} and transactions for user ${userId}:`,
      e
    );
    if (isSdkPlaidError(e)) {
      res.status(e.status || 500).json({
        error_type: e.error_type,
        error_code: e.error_code,
        error_message: e.error_message,
        display_message:
          e.display_message ||
          "An error occurred with Plaid while managing the account and its transactions.",
        request_id: e.request_id,
      });
    } else if (e instanceof Error) {
      res.status(500).json({
        error_code: "INTERNAL_SERVER_ERROR",
        error_message: e.message,
        display_message:
          "Failed to remove linked account and transactions due to a server error.",
      });
    } else {
      res.status(500).json({
        error_code: "UNKNOWN_ERROR",
        error_message:
          "Failed to remove linked account and transactions due to an unexpected error.",
        display_message:
          "Failed to remove linked account and transactions due to an unexpected error.",
      });
    }
  }
};
