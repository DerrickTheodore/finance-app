import plaidItemRepository from "@/repositories/plaidItems/index.js";
import { isSdkPlaidError } from "@myfi/libs/plaid";
import { NextFunction, Request, Response } from "express";

export const getPlaidItems = async (
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
  try {
    const plaidItems = await plaidItemRepository(req.db).getPlaidItemsByUserId(
      parseInt(userId, 10)
    );
    res.status(200).json({ plaidItems });
  } catch (e) {
    console.error("Error getting Plaid items:", e);
    if (isSdkPlaidError(e)) {
      res.status(500).json({
        error_type: e.error_type,
        error_code: e.error_code,
        error_message: e.error_message,
        display_message: e.display_message,
        request_id: e.request_id,
      });
    }
    res.status(500).json({ message: "Error getting Plaid items" });
  }
};
