"use client";

import { useAppState } from "@/context/AppStateContext";
import { useAuth } from "@/context/AuthContext";
import TransactionCategoryPieChartSection from "@/features/transactions/TransactionCategoryPieChartSection";
import { useCategories } from "@/hooks/useCategories";
import { useCategoryTotals } from "@/hooks/useCategoryTotals";
import { useTransactions } from "@/hooks/useTransactions";
import { Suspense } from "react";
import styles from "../page.module.css";

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { selectedItem, selectedAccountIds } = useAppState();

  // Only fetch if user, plaid item, and accounts are present
  const categoriesResult = user
    ? useCategories()
    : { data: [], isFetching: false };
  const categories = categoriesResult.data || [];

  const transactionsResult =
    user && selectedItem && selectedAccountIds.length > 0
      ? useTransactions({
          plaidItemId: selectedItem.plaidItemId,
          accountIds: selectedAccountIds,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        })
      : { data: [] };
  const transactions = transactionsResult.data || [];
  const pieData = useCategoryTotals(transactions);

  if (authLoading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Analytics</h1>
        <Suspense fallback={<div>Loading chart...</div>}>
          <TransactionCategoryPieChartSection
            pieData={pieData}
            categories={categories}
          />
        </Suspense>
      </main>
    </div>
  );
}
