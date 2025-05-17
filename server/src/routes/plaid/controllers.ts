import * as Plaid from "plaid";
import { PlaidError as SDKPlaidErrorType } from "plaid";

import {
  createLinkToken as createLinkTokenService,
  PlaidError as CustomPlaidError,
  exchangePublicToken as exchangePublicTokenService,
  getTransactions as getTransactionsService,
} from "@myfi/libs/plaid";
import { Request, Response } from "express";
import { z } from "zod";

// Type guard for Plaid SDK errors
function isSdkPlaidError(error: any): error is SDKPlaidErrorType {
  return (
    error &&
    typeof error === "object" &&
    ("error_type" in error || "error_code" in error) &&
    "error_message" in error &&
    "status" in error
  );
}

// Controller for POST /api/plaid/create_link_token
export const createLinkTokenController = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.body;
  if (!userId) {
    res.status(400).json({ error_message: "User ID is required." });
    return;
  }
  try {
    const productsToRequest = [
      Plaid.Products.Auth,
      Plaid.Products.Transactions,
    ];
    const linkTokenResponse = await createLinkTokenService({
      // Expect full response object
      userId,
      products: productsToRequest,
    });
    res.status(200).json(linkTokenResponse); // Send the full response object
  } catch (error) {
    if (error instanceof CustomPlaidError) {
      res.status(error.status_code || 500).json({
        error_code: error.error_code,
        error_message: error.error_message,
        display_message: error.display_message,
      });
    } else {
      let errorMessage = "An unexpected server error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(500).json({
        error_message: errorMessage,
      });
    }
  }
};

// Controller for POST /api/plaid/exchange_public_token
export const exchangePublicTokenController = async (
  req: Request,
  res: Response
) => {
  const { public_token } = req.body;
  if (!public_token) {
    res.status(400).json({ error_message: "Public token is required." });
    return;
  }
  try {
    const { accessToken, itemId } = await exchangePublicTokenService(
      public_token
    );
    console.log(
      `Access Token: ${accessToken}, Item ID: ${itemId} (Log for dev only - DO NOT log in production)`
    );
    res.status(200).json({ message: "Public token exchanged successfully." });
  } catch (error) {
    if (error instanceof CustomPlaidError) {
      res.status(error.status_code || 500).json({
        error_code: error.error_code,
        error_message: error.error_message,
        display_message: error.display_message,
      });
    } else {
      let errorMessage = "An unexpected server error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(500).json({
        error_message: errorMessage,
      });
    }
  }
};

// Define Zod schema for getTransactions query parameters
export const GetTransactionsQuerySchema = z.object({
  accessToken: z.string().min(1, "Access token is required."),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format."),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format."),
  options: z
    .object({
      count: z.coerce.number().int().positive().optional(), // coerce to number
      offset: z.coerce.number().int().nonnegative().optional(), // coerce to number
    })
    .optional(),
});

// Controller for GET /api/plaid/transactions
export const getTransactionsController = async (
  req: Request,
  res: Response
) => {
  // The validated query will be on req.query thanks to the middleware
  // For now, casting to unknown then to the inferred type.
  const { accessToken, startDate, endDate, options } =
    req.query as unknown as z.infer<typeof GetTransactionsQuerySchema>;

  try {
    const transactionsResponse = await getTransactionsService({
      accessToken,
      startDate,
      endDate,
      // options should be passed directly if it exists, or undefined otherwise
      ...(options && {
        count: options.count,
        offset: options.offset,
      }),
    });
    res.status(200).json(transactionsResponse);
  } catch (error) {
    if (error instanceof CustomPlaidError) {
      res.status(error.status_code || 500).json({
        error_code: error.error_code,
        error_message: error.error_message,
        display_message: error.display_message,
      });
    } else if (isSdkPlaidError(error)) {
      // Handle Plaid SDK specific errors
      res.status(error.status || 500).json({
        error_code: error.error_code,
        error_message: error.error_message,
        display_message: (error as any).display_message || null, // Plaid SDK errors might not have display_message
      });
    } else {
      let errorMessage = "An unexpected server error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(500).json({
        error_message: errorMessage,
      });
    }
  }
};
