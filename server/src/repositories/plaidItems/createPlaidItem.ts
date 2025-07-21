import { encrypt } from "@myfi/infra/crypto";
import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import { plaidItems } from "@myfi/infra/database/drizzle/schema/models";
import type { NewPlaidItemData } from "@myfi/infra/database/drizzle/schema/types";
import type { Account, PlaidItem } from "@myfi/infra/types";

export const createPlaidItem =
  (db: typeof defaultDb) =>
  async (itemData: NewPlaidItemData): Promise<PlaidItem> => {
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
      accessToken: itemData.plaidAccessToken,
      plaidInstitutionId: newItemRecord.plaidInstitutionId,
      plaidInstitutionName: newItemRecord.plaidInstitutionName,
      accounts: newItemRecord.accounts as Account[] | null,
      createdAt: newItemRecord.createdAt,
      updatedAt: newItemRecord.updatedAt,
    };
  };
