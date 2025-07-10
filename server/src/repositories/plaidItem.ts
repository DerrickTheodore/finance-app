import { decrypt, encrypt } from "@myfi/infra/crypto";
import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import {
  plaidItems,
  transactions,
} from "@myfi/infra/database/drizzle/schema/models";
import type { NewPlaidItemData } from "@myfi/infra/database/drizzle/schema/types";
import type { Account, PlaidItem } from "@myfi/infra/types"; // Import PlaidItem and Account from shared types
import { and, eq } from "drizzle-orm";

export const plaidItemRepository = (db: typeof defaultDb) => ({
  async createPlaidItem(itemData: NewPlaidItemData): Promise<PlaidItem> {
    const encryptedAccessToken = encrypt(itemData.plaidAccessToken);

    const [newItemRecord] = await db
      .insert(plaidItems)
      .values({
        userId: itemData.userId,
        plaidItemId: itemData.plaidItemId,
        plaidAccessToken: encryptedAccessToken,
        plaidInstitutionId: itemData.plaidInstitutionId,
        plaidInstitutionName: itemData.plaidInstitutionName,
        accounts: itemData.accounts,
      })
      .returning();

    if (!newItemRecord) {
      throw new Error("Failed to create Plaid item.");
    }

    return {
      id: newItemRecord.id,
      userId: newItemRecord.userId,
      plaidItemId: newItemRecord.plaidItemId,
      accessToken: itemData.plaidAccessToken, // Map database field to interface field
      plaidInstitutionId: newItemRecord.plaidInstitutionId,
      plaidInstitutionName: newItemRecord.plaidInstitutionName,
      accounts: newItemRecord.accounts as Account[] | null,
      createdAt: newItemRecord.createdAt,
      updatedAt: newItemRecord.updatedAt,
    };
  },

  async getPlaidItemById(
    id: number,
    userId: number
  ): Promise<PlaidItem | null> {
    const result = await db
      .select()
      .from(plaidItems)
      .where(and(eq(plaidItems.id, id), eq(plaidItems.userId, userId)))
      .limit(1);

    if (!result[0]) {
      return null;
    }
    const itemRecord = result[0];

    console.log(
      "[Server] Retrieved Plaid item by ID:",
      JSON.stringify(itemRecord),
      "for user ID:",
      userId
    );
    return {
      id: itemRecord.id,
      userId: itemRecord.userId,
      plaidItemId: itemRecord.plaidItemId,
      accessToken: decrypt(itemRecord.plaidAccessToken), // Map and decrypt
      plaidInstitutionId: itemRecord.plaidInstitutionId,
      plaidInstitutionName: itemRecord.plaidInstitutionName,
      accounts: itemRecord.accounts as Account[] | null,
      createdAt: itemRecord.createdAt,
      updatedAt: itemRecord.updatedAt,
    };
  },

  async getPlaidItemByPlaidItemId(
    plaidItemId: string,
    userId: number
  ): Promise<PlaidItem | null> {
    const result = await db
      .select()
      .from(plaidItems)
      .where(
        and(
          eq(plaidItems.plaidItemId, plaidItemId),
          eq(plaidItems.userId, userId)
        )
      )
      .limit(1);

    if (!result[0]) {
      return null;
    }
    const itemRecord = result[0];
    return {
      id: itemRecord.id,
      userId: itemRecord.userId,
      plaidItemId: itemRecord.plaidItemId,
      accessToken: decrypt(itemRecord.plaidAccessToken), // Map and decrypt
      plaidInstitutionId: itemRecord.plaidInstitutionId,
      plaidInstitutionName: itemRecord.plaidInstitutionName,
      accounts: itemRecord.accounts as Account[] | null,
      createdAt: itemRecord.createdAt,
      updatedAt: itemRecord.updatedAt,
    };
  },

  async getPlaidItemsByUserId(userId: number): Promise<PlaidItem[]> {
    const results = await db
      .select()
      .from(plaidItems)
      .where(eq(plaidItems.userId, userId));

    return results.map((itemRecord) => ({
      id: itemRecord.id,
      userId: itemRecord.userId,
      plaidItemId: itemRecord.plaidItemId,
      accessToken: decrypt(itemRecord.plaidAccessToken), // Map and decrypt
      plaidInstitutionId: itemRecord.plaidInstitutionId,
      plaidInstitutionName: itemRecord.plaidInstitutionName,
      accounts: itemRecord.accounts as Account[] | null,
      createdAt: itemRecord.createdAt,
      updatedAt: itemRecord.updatedAt,
    }));
  },

  async deletePlaidItem(id: number, userId: number): Promise<boolean> {
    // First, delete associated transactions
    await db.delete(transactions).where(eq(transactions.itemId, id));

    // Then, delete the Plaid item
    const result = await db
      .delete(plaidItems)
      .where(and(eq(plaidItems.id, id), eq(plaidItems.userId, userId)));

    return !!result.rowCount;
  },
});
