import {
  Products,
  type LinkTokenCreateResponse as PlaidCreateLinkTokenResponse,
  type PlaidError,
  type Transaction,
} from "plaid";

// Re-export PlaidError with a consistent name
export type { PlaidError as PlaidSdkPlaidError };

// Type guard for PlaidError - using duck typing since PlaidError might be interface-only
export { isSdkPlaidError, PlaidError } from "./errors.js";

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
