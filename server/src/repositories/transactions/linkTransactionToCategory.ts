import type { db as DB } from "@myfi/infra/database/drizzle/db";
import {
  categories,
  NewTransactionCategory,
  TransactionCategory,
  transactions,
  transactionsCategories,
} from "@myfi/infra/database/drizzle/schema/models";
import { and, eq } from "drizzle-orm";

export const linkTransactionToCategory =
  (db: typeof DB) =>
  async (
    userId: number,
    transactionId: number,
    categoryId: number
  ): Promise<TransactionCategory | null> => {
    console.log(`[linkTransactionToCategory] Attempting to link:`, {
      userId,
      transactionId,
      categoryId,
    });

    // Check if transaction belongs to the user
    const transactionCheck = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(
        and(eq(transactions.id, transactionId), eq(transactions.userId, userId))
      )
      .limit(1);

    console.log(`[linkTransactionToCategory] Transaction check result:`, {
      found: transactionCheck.length > 0,
      transactionId,
      userId,
    });

    if (transactionCheck.length === 0) {
      console.log(
        `[linkTransactionToCategory] Transaction ${transactionId} not found for user ${userId}`
      );
      return null;
    }

    // Check if category belongs to the user
    const categoryCheck = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .limit(1);

    console.log(`[linkTransactionToCategory] Category check result:`, {
      found: categoryCheck.length > 0,
      categoryId,
      userId,
    });

    if (categoryCheck.length === 0) {
      console.log(
        `[linkTransactionToCategory] Category ${categoryId} not found for user ${userId}`
      );
      return null;
    }

    // Check if link already exists
    const existingLink = await db
      .select()
      .from(transactionsCategories)
      .where(
        and(
          eq(transactionsCategories.transactionId, transactionId),
          eq(transactionsCategories.categoryId, categoryId)
        )
      )
      .limit(1);

    console.log(`[linkTransactionToCategory] Existing link check:`, {
      exists: existingLink.length > 0,
      transactionId,
      categoryId,
    });

    if (existingLink.length > 0) {
      console.log(
        `[linkTransactionToCategory] Link already exists between transaction ${transactionId} and category ${categoryId}`
      );
      return null;
    }

    const newLink: NewTransactionCategory = {
      transactionId,
      categoryId,
    };

    console.log(`[linkTransactionToCategory] Creating new link:`, newLink);

    const result = await db
      .insert(transactionsCategories)
      .values(newLink)
      .returning();

    console.log(`[linkTransactionToCategory] Insert result:`, result);
    return result[0] || null;
  };
