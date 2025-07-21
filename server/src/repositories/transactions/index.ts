import type { db as DB } from "@myfi/infra/database/drizzle/db";
import { getTransactionById } from "./getTransactionById.js";
import { getTransactions } from "./getTransactions.js";
import { linkTransactionToCategory } from "./linkTransactionToCategory.js";
import { unlinkTransactionFromCategory } from "./unlinkTransactionFromCategory.js";
import { upsertTransactions } from "./upsertTransactions.js";
import { getTransactionsByDateRange } from "./getTransactionsByDateRange.js";

const transactionRepository = (db: typeof DB) => ({
  getTransactionsByDateRange: getTransactionsByDateRange(db),
  upsertTransactions: upsertTransactions(db),
  getTransactions: getTransactions(db),
  getTransactionById: getTransactionById(db),
  linkTransactionToCategory: linkTransactionToCategory(db),
  unlinkTransactionFromCategory: unlinkTransactionFromCategory(db),
});

export default transactionRepository;
