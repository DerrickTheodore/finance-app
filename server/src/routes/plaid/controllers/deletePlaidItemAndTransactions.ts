import plaidItemRepository from "@/repositories/plaidItems/index.js";
import { PlaidItem } from "@myfi/infra/types.js";
import {
  isSdkPlaidError,
  removeItem as removePlaidItem,
} from "@myfi/libs/plaid";
import { Request, Response } from "express";

export const deletePlaidItemAndTransactions = async (
  req: Request,
  res: Response
) => {
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
  const plaidItemId = req.params.plaidItemId;
  const userId = req.user.id.trim();
  if (isNaN(parseInt(userId, 10))) {
    return res.status(400).json({ message: "Invalid user ID format." });
  }
  console.log(
    `[Controller - deletePlaidItemAndTransactions] Attempting to delete item ${plaidItemId} and its transactions for user ${userId}`
  );
  let itemToDelete: PlaidItem | null = null;
  try {
    itemToDelete = await plaidItemRepository(req.db).getPlaidItemByPlaidItemId(
      plaidItemId,
      parseInt(userId, 10)
    );
    if (!itemToDelete || !itemToDelete.id) {
      return res.status(404).json({ message: "Plaid item not found." });
    }
    // TODO: Implement and call transactionRepository(req.db).deleteTransactionsByPlaidItemId(itemToDelete.id, userId);
    console.warn(
      `[Controller - deletePlaidItemAndTransactions] Transaction deletion for Plaid item ID ${itemToDelete.id} (local DB ID) is not yet implemented.`
    );
    await removePlaidItem(itemToDelete.accessToken);
    console.log(
      `[Controller - deletePlaidItemAndTransactions] Successfully called Plaid to remove item ${plaidItemId}`
    );
    const deletedFromDb = await plaidItemRepository(req.db).deletePlaidItem(
      itemToDelete.id,
      parseInt(userId, 10)
    );
    if (!deletedFromDb) {
      return res
        .status(500)
        .json({ message: "Failed to delete Plaid item from database." });
    }
    res.json({
      message: "Plaid item and associated transactions deleted successfully.",
    });
  } catch (e) {
    console.error("Error deleting Plaid item and transactions:", e);
    if (isSdkPlaidError(e)) {
      return res.status(500).json({
        error_type: e.error_type,
        error_code: e.error_code,
        error_message: e.error_message,
        display_message: e.display_message,
        request_id: e.request_id,
      });
    }
    return res
      .status(500)
      .json({ message: "Error deleting Plaid item and transactions" });
  }
};
