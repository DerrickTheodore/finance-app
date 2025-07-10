import type { db as DB } from "@myfi/infra/database/drizzle/db";
import {
  categories,
  NewTransaction,
  NewTransactionCategory,
  TransactionCategory,
  transactions,
  transactionsCategories,
} from "@myfi/infra/database/drizzle/schema/models";
import type { ApiTransaction, Category } from "@myfi/infra/types";
import type { PlaidTransaction as PlaidTransactionFromLib } from "@myfi/libs/plaid";
import { and, count, desc, eq, getTableColumns, sql, SQL } from "drizzle-orm";

// Helper type for Plaid transaction data
type MappedPlaidTransaction = Omit<
  NewTransaction,
  "id" | "itemId" | "userId" | "createdAt" | "updatedAt" | "amount"
> & {
  plaidTransactionId: string;
  plaidAccountId: string;
  name: string;
  amount: number;
  isoCurrencyCode: string | null;
  unofficialCurrencyCode: string | null;
  date: string;
  pending: boolean;
  paymentChannel: string;
  merchantName?: string | null;
  pendingTransactionId?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

// Helper type for Plaid transaction data that will be mapped to NewTransaction
// Export this type so it can be imported by other modules
export type PlaidTransactionForDb = Omit<
  PlaidTransactionFromLib,
  "category" | "counterparties" | "personal_finance_category"
> & {
  categoryId?: number | null;
  personalFinanceCategory?: PlaidTransactionFromLib["personal_finance_category"];
  counterparties?: PlaidTransactionFromLib["counterparties"];
};

export const transactionRepository = (db: typeof DB) => ({
  async upsertTransactions(
    userId: number,
    plaidItemId: number,
    plaidTransactions: PlaidTransactionForDb[]
  ): Promise<void> {
    if (plaidTransactions.length === 0) {
      return;
    }

    const transactionsToInsert: NewTransaction[] = plaidTransactions.map(
      (pt) => ({
        userId,
        itemId: plaidItemId,
        plaidTransactionId: pt.transaction_id,
        plaidAccountId: pt.account_id,
        name: pt.name,
        merchantName: pt.merchant_name,
        amount: pt.amount.toString(), // Ensure amount is string for numeric type
        isoCurrencyCode: pt.iso_currency_code,
        unofficialCurrencyCode: pt.unofficial_currency_code,
        date: pt.date,
        pending: pt.pending,
        pendingTransactionId: pt.pending_transaction_id,
        paymentChannel: pt.payment_channel,
        address: pt.location.address,
        city: pt.location.city,
        region: pt.location.region,
        postalCode: pt.location.postal_code,
        country: pt.location.country,
        // categoryId will be handled by linking table
      })
    );

    await db
      .insert(transactions)
      .values(transactionsToInsert)
      .onConflictDoUpdate({
        target: transactions.plaidTransactionId,
        set: {
          name: sql.raw("excluded.name"),
          merchantName: sql.raw("excluded.merchant_name"),
          amount: sql.raw("excluded.amount"),
          isoCurrencyCode: sql.raw("excluded.iso_currency_code"),
          unofficialCurrencyCode: sql.raw("excluded.unofficial_currency_code"),
          date: sql.raw("excluded.date"),
          pending: sql.raw("excluded.pending"),
          pendingTransactionId: sql.raw("excluded.pending_transaction_id"),
          paymentChannel: sql.raw("excluded.payment_channel"),
          address: sql.raw("excluded.address"),
          city: sql.raw("excluded.city"),
          region: sql.raw("excluded.region"),
          postalCode: sql.raw("excluded.postal_code"),
          country: sql.raw("excluded.country"),
          updatedAt: new Date(),
        },
      });
  },

  async getTransactions(
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
  }> {
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
      .$dynamic(); // Use $dynamic for query builder

    const countQuery = db
      .select({ value: count() })
      .from(transactions)
      .$dynamic(); // Use $dynamic for query builder

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
      data: data.map((t) => ({
        id: t.id,
        plaidTransactionId: t.plaidTransactionId,
        plaidAccountId: t.plaidAccountId,
        itemId: t.itemId,
        userId: t.userId,
        name: t.name,
        merchantName: t.merchantName,
        amount: t.amount, // DB 'amount' is string, ApiTransaction 'amount' is string
        isoCurrencyCode: t.isoCurrencyCode, // DB 'isoCurrencyCode' maps to ApiTransaction 'isoCurrencyCode'
        unofficialCurrencyCode: t.unofficialCurrencyCode,
        date: t.date, // DB 'date' is string (date type), ApiTransaction 'date' is string
        pending: t.pending,
        pendingTransactionId: t.pendingTransactionId,
        paymentChannel: t.paymentChannel,
        address: t.address,
        city: t.city,
        region: t.region,
        postalCode: t.postalCode,
        country: t.country,
        createdAt: t.createdAt.toISOString(), // Convert Date to string
        updatedAt: t.updatedAt.toISOString(), // Convert Date to string
        categories: (t.categories || []) as Category[], // Ensure categories is Category[]
      })),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  },

  async getTransactionById(
    userId: number,
    transactionId: number
  ): Promise<ApiTransaction | null> {
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
    return {
      id: t.id,
      plaidTransactionId: t.plaidTransactionId,
      plaidAccountId: t.plaidAccountId,
      itemId: t.itemId,
      userId: t.userId,
      name: t.name,
      merchantName: t.merchantName,
      amount: t.amount, // DB 'amount' is string, ApiTransaction 'amount' is string
      isoCurrencyCode: t.isoCurrencyCode, // DB 'isoCurrencyCode' maps to ApiTransaction 'isoCurrencyCode'
      unofficialCurrencyCode: t.unofficialCurrencyCode,
      date: t.date, // DB 'date' is string (date type), ApiTransaction 'date' is string
      pending: t.pending,
      pendingTransactionId: t.pendingTransactionId,
      paymentChannel: t.paymentChannel,
      address: t.address,
      city: t.city,
      region: t.region,
      postalCode: t.postalCode,
      country: t.country,
      createdAt: t.createdAt.toISOString(), // Convert Date to string
      updatedAt: t.updatedAt.toISOString(), // Convert Date to string
      categories: (t.categories || []) as Category[], // Ensure categories is Category[]
    };
  },

  async linkTransactionToCategory(
    userId: number,
    transactionId: number,
    categoryId: number
  ): Promise<TransactionCategory | null> {
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
  },

  async unlinkTransactionFromCategory(
    userId: number,
    transactionId: number,
    categoryId: number
  ): Promise<boolean> {
    // Optional: Check if transaction and category belong to the user before deleting
    // This adds overhead but ensures data integrity if called from an insecure context.
    // For internal server use, if inputs are trusted, this might be skipped.
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
  },
});
