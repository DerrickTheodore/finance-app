import type { db as DB } from "@myfi/infra/database/drizzle/db";
import {
  categories,
  transactions,
  transactionsCategories,
} from "@myfi/infra/database/drizzle/schema/models";
import type { ApiTransaction, Category } from "@myfi/infra/types";
import { and, eq, getTableColumns, sql } from "drizzle-orm";

export const getTransactionById =
  (db: typeof DB) =>
  async (
    userId: number,
    transactionId: number
  ): Promise<ApiTransaction | null> => {
    const result = await db
      .select({
        ...getTableColumns(transactions),
        categories: sql<
          Category[]
        >`(SELECT COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name, 'color', c.color, 'icon', c.icon)) FILTER (WHERE c.id IS NOT NULL), '[]'::json) FROM ${categories} c JOIN ${transactionsCategories} tc ON c.id = tc.category_id WHERE tc.transaction_id = "transaction".id)`.as(
          "categories"
        ),
      })
      .from(transactions)
      .where(
        and(eq(transactions.userId, userId), eq(transactions.id, transactionId))
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }
    const t = result[0];
    const transaction: ApiTransaction = {
      id: t.id,
      plaidTransactionId: t.plaidTransactionId,
      plaidAccountId: t.plaidAccountId,
      itemId: t.itemId,
      userId: t.userId,
      name: t.name,
      merchantName: t.merchantName,
      amount: t.amount,
      isoCurrencyCode: t.isoCurrencyCode,
      unofficialCurrencyCode: t.unofficialCurrencyCode,
      date: t.date,
      pending: t.pending,
      pendingTransactionId: t.pendingTransactionId,
      paymentChannel: t.paymentChannel,
      address: t.address,
      city: t.city,
      region: t.region,
      postalCode: t.postalCode,
      country: t.country,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      categories: t.categories || [],
    };

    return transaction;
  };
