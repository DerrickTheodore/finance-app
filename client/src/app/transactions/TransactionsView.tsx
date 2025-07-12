"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Category,
  PlaidItemWithAccounts,
  TransactionCategory,
  TransactionWithCategories,
} from "@myfi/server/types";
import { UseMutationResult } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { useAppState } from "../../context/AppStateContext";
import DateRangeSelector from "../../features/banking/DateRangeSelector";
import TransactionsSection from "../../features/transactions/TransactionsSection";
import { useCategories } from "../../hooks/useCategories";
import { useTransactionCategories } from "../../hooks/useTransactionCategories";
import { useTransactions } from "../../hooks/useTransactions";
import styles from "../page.module.css";

// Pure presentational component for transactions UI
interface TransactionsViewUIProps {
  transactions: TransactionWithCategories[];
  categories: Category[];
  isFetchingTransactions: boolean;
  isFetchingCategories: boolean;
  assignMutation: UseMutationResult<
    TransactionCategory,
    Error,
    {
      transactionId: number;
      categoryId: number;
      selectElement?: HTMLSelectElement;
    }
  >;
  unlinkMutation: UseMutationResult<
    { message: string },
    Error,
    { transactionId: number; categoryId: number }
  >;
  transactionFetchError: Error | null;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onFetch: () => void;
  missingParams: boolean;
  queryAttempted: boolean;
}

function TransactionsViewUI({
  transactions,
  categories,
  isFetchingTransactions,
  isFetchingCategories,
  assignMutation,
  unlinkMutation,
  transactionFetchError,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onFetch,
  missingParams,
  queryAttempted,
}: TransactionsViewUIProps) {
  return (
    <>
      <DateRangeSelector
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onFetch={onFetch}
        isFetching={isFetchingTransactions}
        isFetchDisabled={missingParams || isFetchingTransactions}
      />
      {transactionFetchError && (
        <section className={styles.section}>
          <p style={{ color: "red" }}>
            Error fetching transactions: {transactionFetchError.message}
          </p>
        </section>
      )}
      <TransactionsSection
        transactions={transactions}
        categories={categories}
        isFetchingCategories={isFetchingCategories}
        assignMutation={assignMutation}
        unlinkMutation={unlinkMutation}
        queryAttempted={queryAttempted}
        missingParams={missingParams}
      />
    </>
  );
}

// Container component for data logic
function TransactionsSuspenseView(props: {
  selectedItem: PlaidItemWithAccounts | null;
  selectedAccountIds: string[];
  startDate: string;
  endDate: string;
  assignMutation: UseMutationResult<
    TransactionCategory,
    Error,
    {
      transactionId: number;
      categoryId: number;
      selectElement?: HTMLSelectElement;
    }
  >;
  unlinkMutation: UseMutationResult<
    { message: string },
    Error,
    { transactionId: number; categoryId: number }
  >;
  categories: Category[];
  isFetchingCategories: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}) {
  const {
    selectedItem,
    selectedAccountIds,
    startDate,
    endDate,
    assignMutation,
    unlinkMutation,
    categories,
    isFetchingCategories,
    onStartDateChange,
    onEndDateChange,
  } = props;

  const missingParams = !selectedItem || selectedAccountIds.length === 0;

  const {
    data: transactions = [],
    isFetching: isFetchingTransactions,
    error: transactionFetchError,
    refetch,
  } = useTransactions({
    plaidItemId: selectedItem?.plaidItemId || "",
    accountIds: selectedAccountIds,
    startDate,
    endDate,
  });

  return (
    <TransactionsViewUI
      transactions={transactions}
      categories={categories}
      isFetchingTransactions={isFetchingTransactions}
      isFetchingCategories={isFetchingCategories}
      assignMutation={assignMutation}
      unlinkMutation={unlinkMutation}
      transactionFetchError={transactionFetchError || null}
      startDate={startDate}
      endDate={endDate}
      onStartDateChange={onStartDateChange}
      onEndDateChange={onEndDateChange}
      onFetch={refetch}
      missingParams={missingParams}
      queryAttempted={!missingParams}
    />
  );
}

export default function TransactionsView() {
  const { selectedItem, selectedAccountIds } = useAppState();
  const { user } = useAuth();
  const { assignMutation, unlinkMutation } = useTransactionCategories();
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  // Only call useCategories if user is present
  const categoriesResult = useCategories();
  const categories = categoriesResult.data || [];
  const isFetchingCategories = categoriesResult.isFetching;

  if (!user) {
    // Still short-circuit if not authenticated
    return null;
  }

  // Always render the page, let child handle empty/invalid state
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Transactions</h1>
        <Suspense fallback={<div>Loading transactions...</div>}>
          <TransactionsSuspenseView
            selectedItem={selectedItem}
            selectedAccountIds={selectedAccountIds}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            assignMutation={assignMutation}
            unlinkMutation={unlinkMutation}
            categories={categories}
            isFetchingCategories={isFetchingCategories}
          />
        </Suspense>
      </main>
    </div>
  );
}
