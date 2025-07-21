import { decrypt } from "@myfi/infra/crypto";
import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import { plaidItems } from "@myfi/infra/database/drizzle/schema/models";
import type { Account, PlaidItem } from "@myfi/infra/types";
import { eq } from "drizzle-orm";

export const getPlaidItemsByUserId =
  (db: typeof defaultDb) =>
  async (userId: number): Promise<PlaidItem[]> => {
    const results = await db
      .select()
      .from(plaidItems)
      .where(eq(plaidItems.userId, userId));

    return results.map((itemRecord) => ({
      id: itemRecord.id,
      userId: itemRecord.userId,
      plaidItemId: itemRecord.plaidItemId,
      accessToken: decrypt(itemRecord.plaidAccessToken),
      plaidInstitutionId: itemRecord.plaidInstitutionId,
      plaidInstitutionName: itemRecord.plaidInstitutionName,
      accounts: itemRecord.accounts as Account[] | null,
      createdAt: itemRecord.createdAt,
      updatedAt: itemRecord.updatedAt,
    }));
  };
