// /Users/derricktheodore/app-library/finance-app/infra/plaid-types.ts
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { plaidItems } from "./models.js"; // Changed from ./models.js

/**
 * The Drizzle table definition for Plaid items.
 */
export const plaidItemsDefinition = plaidItems;

/**
 * Represents a Plaid item record as stored in the database.
 * This type is derived from the Drizzle schema in the infra package.
 */
export type PlaidItemRecord = InferSelectModel<typeof plaidItemsDefinition>;

/**
 * Represents the structure for inserting a new Plaid item into the database.
 * This type is derived from the Drizzle schema in the infra package.
 */
export type PlaidItemInsert = InferInsertModel<typeof plaidItemsDefinition>;

// Type for inserting a new PlaidItem (access token will be plaintext here, then encrypted)
export type NewPlaidItemInsert = InferInsertModel<typeof plaidItems>;

// Type for a PlaidItem that business logic will use (access token decrypted)
export interface PlaidItem extends Omit<PlaidItemRecord, "plaidAccessToken"> {
  plaidAccessToken: string; // Decrypted
}

// Type for creating a new PlaidItem (plaintext access token)
export interface NewPlaidItemData {
  userId: number;
  plaidItemId: string;
  plaidAccessToken: string; // Plaintext, will be encrypted
  plaidInstitutionId: string;
  plaidInstitutionName?: string | null; // Optional
  accounts?: any; // Add accounts property, use 'any' for now, refine later if needed
}
