import plaidItemRepository from "@/repositories/plaidItems/index.js";
import { isSdkPlaidError, removeItem } from "@myfi/libs/plaid";
import { Request, Response } from "express";

export const removePlaidItem = async (req: Request, res: Response) => {
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
  const { itemId } = req.params;
  const userId = req.user.id.trim();
  if (!itemId) {
    return res
      .status(400)
      .json({ message: "Missing itemId in request params" });
  }
  try {
    const plaidItem = await plaidItemRepository(
      req.db
    ).getPlaidItemByPlaidItemId(itemId, parseInt(userId, 10));
    if (!plaidItem || !plaidItem.id) {
      return res.status(404).json({ message: "Plaid item not found" });
    }
    if (plaidItem.userId !== parseInt(userId, 10)) {
      return res
        .status(403)
        .json({ message: "User not authorized to remove this Plaid item." });
    }
    await removeItem(plaidItem.accessToken);
    await plaidItemRepository(req.db).deletePlaidItem(
      plaidItem.id,
      parseInt(userId, 10)
    );
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
      };
      return res
        .status(500)
        .json({ message: "Error removing Plaid item", error: errorDetails });
    }
    res.status(500).json({ message: "Error removing Plaid item", error: e });
  }
};
