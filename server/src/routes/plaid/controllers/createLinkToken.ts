import {
  PlaidCreateLinkTokenResponse,
  PlaidProducts,
  createLinkToken as createLinkTokenService,
  isSdkPlaidError,
} from "@myfi/libs/plaid";
import { NextFunction, Request, Response } from "express";

export const createLinkToken = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (
    !req.user?.id ||
    typeof req.user.id !== "string" ||
    req.user.id.trim() === ""
  ) {
    res.status(401).json({ error: "User must be authenticated." });
    return;
  }
  try {
    const userId = req.user.id.trim();
    const createLinkTokenResponse: PlaidCreateLinkTokenResponse =
      await createLinkTokenService({
        userId,
        products: [PlaidProducts.Transactions],
      });
    res.json(createLinkTokenResponse);
  } catch (e: unknown) {
    console.error("Error creating link token:", e);
    if (isSdkPlaidError(e)) {
      const errorDetails = {
        error_type: e.error_type,
        error_code: e.error_code,
        error_message: e.error_message,
        display_message: e.display_message,
        request_id: e.request_id,
        status_code: e.status,
      };
      res
        .status(500)
        .json({ message: "Error creating link token", error: errorDetails });
      return;
    }
    res.status(500).json({ message: "Error creating link token", error: e });
  }
};
