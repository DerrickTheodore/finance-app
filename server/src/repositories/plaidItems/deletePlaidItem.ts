import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import {
  plaidItems,
  transactions,
} from "@myfi/infra/database/drizzle/schema/models";
import { and, eq } from "drizzle-orm";

export const deletePlaidItem =
  (db: typeof defaultDb) =>
  async (id: number, userId: number): Promise<boolean> => {
    // First, delete associated transactions
    await db.delete(transactions).where(eq(transactions.itemId, id));

    // Then, delete the Plaid item
    const result = await db
      .delete(plaidItems)
      .where(and(eq(plaidItems.id, id), eq(plaidItems.userId, userId)));

    return !!result.rowCount;
  };
