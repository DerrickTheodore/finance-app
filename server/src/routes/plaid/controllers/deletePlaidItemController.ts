import plaidItemRepository from "@/repositories/plaidItems/index.js";
import { PlaidItem } from "@myfi/infra/types.js";
import {
  isSdkPlaidError,
  removeItem as removePlaidItem,
} from "@myfi/libs/plaid";
import { NextFunction, Request, Response } from "express";

export const deletePlaidItemController = async (
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
  const { plaidItemId } = req.params;
  const userId = req.user.id.trim();
  if (isNaN(parseInt(userId, 10))) {
    res.status(400).json({ message: "Invalid user ID format." });
    return;
  }
  console.log(
    `[Controller - deletePlaidItemController] Attempting to delete item ${plaidItemId} for user ${userId}`
  );
  let itemToDelete: PlaidItem | null = null;
  try {
    itemToDelete = await plaidItemRepository(req.db).getPlaidItemByPlaidItemId(
      plaidItemId,
      parseInt(userId, 10)
    );
    if (!itemToDelete || !itemToDelete.id) {
      console.log(
        `[Controller - deletePlaidItemController] Item ${plaidItemId} not found for user ${userId}`
      );
      res.status(404).json({ message: "Plaid item not found." });
      return;
    }
    await removePlaidItem(itemToDelete.accessToken);
    console.log(
      `[Controller - deletePlaidItemController] Successfully called Plaid to remove item ${plaidItemId}`
    );
    console.warn(
      `[Controller - deletePlaidItemController] Transaction deletion for Plaid item ID ${itemToDelete.id} (local DB ID) is not yet implemented.`
    );
    const deletedFromDb = await plaidItemRepository(req.db).deletePlaidItem(
      itemToDelete.id,
      parseInt(userId, 10)
    );
    if (!deletedFromDb) {
      res
        .status(500)
        .json({ message: "Failed to delete Plaid item from database." });
      return;
    }
    res.json({ message: "Plaid item deleted successfully." });
  } catch (e) {
    console.error("Error deleting Plaid item:", e);
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
    res.status(500).json({ message: "Error deleting Plaid item" });
  }
};
