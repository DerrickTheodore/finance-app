import type { db as DB } from "@myfi/infra/database/drizzle/db";
import {
  NewTransaction,
  transactions,
} from "@myfi/infra/database/drizzle/schema/models";
import type { PlaidTransaction as PlaidTransactionFromLib } from "@myfi/libs/plaid";
import { sql } from "drizzle-orm";

// Helper type for Plaid transaction data that will be mapped to NewTransaction
export type PlaidTransactionForDb = Omit<
  PlaidTransactionFromLib,
  "category" | "counterparties" | "personal_finance_category"
> & {
  categoryId?: number | null;
  personalFinanceCategory?: PlaidTransactionFromLib["personal_finance_category"];
  counterparties?: PlaidTransactionFromLib["counterparties"];
};

export const upsertTransactions =
  (db: typeof DB) =>
  async (
    userId: number,
    plaidItemId: number,
    plaidTransactions: PlaidTransactionForDb[]
  ): Promise<void> => {
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
        amount: pt.amount.toString(),
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
  };
