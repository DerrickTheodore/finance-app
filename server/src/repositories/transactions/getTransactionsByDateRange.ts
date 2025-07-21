import type { db as DB } from "@myfi/infra/database/drizzle/db";
import {
  categories as categoriesTable,
  Category,
  transactionsCategories,
  transactions as transactionsTable,
} from "@myfi/infra/database/drizzle/schema/models";
import {
  and,
  between,
  desc,
  eq,
  getTableColumns,
  inArray,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const getTransactionsByDateRange =
  (db: typeof DB) =>
  async (
    userId: number,
    plaidItemId: number,
    accountIds: string[],
    startDate: string,
    endDate: string
  ) => {
    const category = alias(categoriesTable, "category");

    const results = await db
      .select({
        ...getTableColumns(transactionsTable),
        categories: sql<
          Category[]
        >`coalesce(json_agg(json_strip_nulls(row_to_json(${category}))) filter (where ${category.id} is not null), '[]'::json)`,
      })
      .from(transactionsTable)
      .leftJoin(
        transactionsCategories,
        eq(transactionsTable.id, transactionsCategories.transactionId)
      )
      .leftJoin(category, eq(transactionsCategories.categoryId, category.id))
      .where(
        and(
          eq(transactionsTable.userId, userId),
          eq(transactionsTable.itemId, plaidItemId),
          inArray(transactionsTable.plaidAccountId, accountIds),
          between(transactionsTable.date, startDate, endDate)
        )
      )
      .groupBy(transactionsTable.id)
      .orderBy(desc(transactionsTable.date));

    return results;
  };
