import * as Plaid from "plaid";
import {
  PlaidError as SDKPlaidErrorType,
  TransactionsGetResponse,
} from "plaid";

import {
  createLinkToken as createLinkTokenService,
  PlaidError as CustomPlaidError, // Corrected import source
  exchangePublicToken as exchangePublicTokenService,
  getTransactions as getTransactionsService,
} from "../../../../libs/dist/plaid/index.js"; // Changed to import from libs/plaid/index.js
import type { AppRequestController, ErrorResponseModel } from "../../types.js"; // Import common types

// Request Body and Query Param Interfaces
interface CreateLinkTokenReqBody {
  userId: string;
}
interface ExchangePublicTokenReqBody {
  public_token: string;
}
interface TransactionsQuery {
  access_token: string;
  start_date: string;
  end_date: string;
  account_ids?: string;
}

// Response Interfaces
interface LinkTokenResponse {
  // This local interface might be causing confusion, SDK provides Plaid.LinkTokenCreateResponse
  link_token: string;
  expiration: string;
  request_id: string;
}
interface ExchangeTokenResponse {
  message: string;
}
// TransactionsGetResponse is imported from 'plaid' for the success case

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
export const createLinkTokenController: AppRequestController<
  unknown,
  Plaid.LinkTokenCreateResponse | ErrorResponseModel, // Use SDK's LinkTokenCreateResponse
  CreateLinkTokenReqBody,
  unknown
> = async (req, res) => {
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
    } else if (isSdkPlaidError(error)) {
      const status = typeof error.status === "number" ? error.status : 500;
      res.status(status).json({
        error_code: error.error_code || error.error_type,
        error_message: error.error_message,
        display_message: error.display_message,
      });
    } else {
      const err = error as Error;
      res.status(500).json({
        error_message: err.message || "An unexpected server error occurred.",
      });
    }
  }
};

// Controller for POST /api/plaid/exchange_public_token
export const exchangePublicTokenController: AppRequestController<
  unknown,
  ExchangeTokenResponse | ErrorResponseModel,
  ExchangePublicTokenReqBody,
  unknown
> = async (req, res) => {
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
    } else if (isSdkPlaidError(error)) {
      const status = typeof error.status === "number" ? error.status : 500;
      res.status(status).json({
        error_code: error.error_code || error.error_type,
        error_message: error.error_message,
        display_message: error.display_message,
      });
    } else {
      const err = error as Error;
      res.status(500).json({
        error_message: err.message || "An unexpected server error occurred.",
      });
    }
  }
};

// Controller for GET /api/plaid/transactions
export const getTransactionsController: AppRequestController<
  unknown,
  TransactionsGetResponse | ErrorResponseModel,
  unknown,
  TransactionsQuery
> = async (req, res) => {
  const { access_token, start_date, end_date, account_ids } = req.query;
  if (!access_token) {
    res.status(400).json({ error_message: "Access token is required." });
    return;
  }
  if (!start_date || !end_date) {
    res
      .status(400)
      .json({ error_message: "Start date and end date are required." });
    return;
  }
  try {
    const accountIdsArray = account_ids ? account_ids.split(",") : undefined;
    const transactionsData = await getTransactionsService({
      accessToken: access_token,
      startDate: start_date,
      endDate: end_date,
      accountIds: accountIdsArray,
    });
    res.status(200).json(transactionsData);
  } catch (error) {
    if (error instanceof CustomPlaidError) {
      if (
        error.isTokenError &&
        typeof error.isTokenError === "function" &&
        error.isTokenError()
      ) {
        res.status(401).json({
          error_code: error.error_code,
          error_message: error.error_message,
          display_message: error.display_message,
          action_required: "REAUTHENTICATE",
        });
      } else {
        res.status(error.status_code || 500).json({
          error_code: error.error_code,
          error_message: error.error_message,
          display_message: error.display_message,
        });
      }
    } else if (isSdkPlaidError(error)) {
      if (
        error.error_type === "ITEM_ERROR" &&
        error.error_code === "ITEM_LOGIN_REQUIRED"
      ) {
        res.status(401).json({
          error_code: error.error_code,
          error_message: error.error_message,
          display_message: error.display_message,
          action_required: "REAUTHENTICATE_ITEM",
        });
      } else {
        const status = typeof error.status === "number" ? error.status : 500;
        res.status(status).json({
          error_code: error.error_code || error.error_type,
          error_message: error.error_message,
          display_message: error.display_message,
        });
      }
    } else {
      const err = error as Error;
      res.status(500).json({
        error_message: err.message || "An unexpected server error occurred.",
      });
    }
  }
};
