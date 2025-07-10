import { Products, Transaction, type LinkTokenCreateResponse as PlaidCreateLinkTokenResponse, type PlaidError } from "plaid";
export type { PlaidError as PlaidSdkPlaidError };
export declare function isSdkPlaidError(error: any): error is PlaidError;
export { Products as PlaidProducts, Transaction as PlaidTransaction, type PlaidCreateLinkTokenResponse, };
export * from "./client.js";
export * from "./enums.js";
export { createLinkToken, exchangePublicToken, getTransactions, removeItem, } from "./services/index.js";
//# sourceMappingURL=index.d.ts.map