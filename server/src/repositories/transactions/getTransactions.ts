import type { db as DB } from "@myfi/infra/database/drizzle/db";
import {
  categories,
  transactions,
  transactionsCategories,
} from "@myfi/infra/database/drizzle/schema/models";
import type { ApiTransaction, Category } from "@myfi/infra/types";
import { and, count, desc, eq, getTableColumns, sql, SQL } from "drizzle-orm";

export const getTransactions =
  (db: typeof DB) =>
  async (
    userId: number,
    plaidItemId: number,
    options: { page?: number; pageSize?: number; categoryId?: number } = {}
  ): Promise<{
    data: ApiTransaction[];
    meta: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const { page = 1, pageSize = 10, categoryId } = options;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [
      eq(transactions.userId, userId),
      eq(transactions.itemId, plaidItemId),
    ];

    if (categoryId) {
      conditions.push(eq(transactionsCategories.categoryId, categoryId));
    }

    const dataQuery = db
      .select({
        ...getTableColumns(transactions),
        categories: sql<
          Category[]
        >`(SELECT COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name, 'color', c.color, 'icon', c.icon)) FILTER (WHERE c.id IS NOT NULL), '[]'::json) FROM ${categories} c JOIN ${transactionsCategories} tc ON c.id = tc.category_id WHERE tc.transaction_id = "transaction".id)`.as(
          "categories"
        ),
      })
      .from(transactions)
      .$dynamic();

    const countQuery = db
      .select({ value: count() })
      .from(transactions)
      .$dynamic();

    if (categoryId) {
      dataQuery.innerJoin(
        transactionsCategories,
        eq(transactions.id, transactionsCategories.transactionId)
      );
      countQuery.innerJoin(
        transactionsCategories,
        eq(transactions.id, transactionsCategories.transactionId)
      );
    }

    const finalDataQuery = dataQuery
      .where(and(...conditions))
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(pageSize)
      .offset(offset);

    const finalCountQuery = countQuery.where(and(...conditions));

    const [data, totalCountResult] = await Promise.all([
      finalDataQuery,
      finalCountQuery,
    ]);

    const total = totalCountResult[0]?.value ?? 0;

    return {
      data: data.map<ApiTransaction>((t) => ({
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
        categories: (t.categories || []) as Category[],
      })),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  };
