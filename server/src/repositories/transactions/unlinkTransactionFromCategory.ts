import type { db as DB } from "@myfi/infra/database/drizzle/db";
import {
  transactions,
  transactionsCategories,
} from "@myfi/infra/database/drizzle/schema/models";
import { and, eq } from "drizzle-orm";

export const unlinkTransactionFromCategory =
  (db: typeof DB) =>
  async (
    userId: number,
    transactionId: number,
    categoryId: number
  ): Promise<boolean> => {
    // Check if transaction belongs to the user before deleting
    const transactionCheck = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(
        and(eq(transactions.id, transactionId), eq(transactions.userId, userId))
      )
      .limit(1);

    if (transactionCheck.length === 0) {
      return false; // Transaction not found or doesn't belong to user
    }

    const result = await db
      .delete(transactionsCategories)
      .where(
        and(
          eq(transactionsCategories.transactionId, transactionId),
          eq(transactionsCategories.categoryId, categoryId)
        )
      )
      .returning();
    return result.length > 0;
  };
