import { decrypt } from "@myfi/infra/crypto";
import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import { plaidItems } from "@myfi/infra/database/drizzle/schema/models";
import type { Account, PlaidItem } from "@myfi/infra/types";
import { and, eq } from "drizzle-orm";

export const getPlaidItemByPlaidItemId =
  (db: typeof defaultDb) =>
  async (plaidItemId: string, userId: number): Promise<PlaidItem | null> => {
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
      accessToken: decrypt(itemRecord.plaidAccessToken),
      plaidInstitutionId: itemRecord.plaidInstitutionId,
      plaidInstitutionName: itemRecord.plaidInstitutionName,
      accounts: itemRecord.accounts as Account[] | null,
      createdAt: itemRecord.createdAt,
      updatedAt: itemRecord.updatedAt,
    };
  };
