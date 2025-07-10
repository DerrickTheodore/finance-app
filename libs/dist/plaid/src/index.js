import { Products, } from "plaid";
// Type guard for PlaidError - using duck typing since PlaidError might be interface-only
export function isSdkPlaidError(error) {
    return (error &&
        typeof error === "object" &&
        "error_type" in error &&
        "error_code" in error);
}
export { Products as PlaidProducts, };
export * from "./client.js"; // Exports from your Plaid client setup
export * from "./enums.js"; // If you have enums.ts
export { createLinkToken, exchangePublicToken, getTransactions, removeItem, } from "./services/index.js"; // Export service functions explicitly
//# sourceMappingURL=index.js.map