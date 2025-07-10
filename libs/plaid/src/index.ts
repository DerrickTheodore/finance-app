import {
  Products,
  Transaction,
  type LinkTokenCreateResponse as PlaidCreateLinkTokenResponse,
  type PlaidError,
} from "plaid";

// Re-export PlaidError with a consistent name
export type { PlaidError as PlaidSdkPlaidError };

// Type guard for PlaidError - using duck typing since PlaidError might be interface-only
export function isSdkPlaidError(error: any): error is PlaidError {
  return (
    error &&
    typeof error === "object" &&
    "error_type" in error &&
    "error_code" in error
  );
}

export {
  Products as PlaidProducts,
  Transaction as PlaidTransaction,
  type PlaidCreateLinkTokenResponse,
};

export * from "./client.js"; // Exports from your Plaid client setup
export * from "./enums.js"; // If you have enums.ts
export {
  createLinkToken,
  exchangePublicToken,
  getTransactions,
  removeItem,
} from "./services/index.js"; // Export service functions explicitly
