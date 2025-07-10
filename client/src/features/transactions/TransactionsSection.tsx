import {
  Category,
  TransactionCategory,
  TransactionWithCategories,
} from "@myfi/server/types";
import { UseMutationResult } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";
import styles from "../../app/page.module.css";
import EmptyState from "../../components/EmptyState";
import TransactionRow from "./TransactionRow";

interface Props {
  transactions: TransactionWithCategories[];
  categories: Category[];
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
  queryAttempted?: boolean; // New prop to indicate if a query was made
  missingParams?: boolean; // New prop to indicate if required params are missing
}

const TransactionsSection: React.FC<Props> = ({
  transactions,
  categories,
  isFetchingCategories,
  assignMutation,
  unlinkMutation,
  queryAttempted = true,
  missingParams = false,
}) => {
  if (missingParams) {
    return (
      <EmptyState
        message="No account or date range selected. Please select an account and date range, or go to the Accounts page."
        action={
          <Link href="/accounts" className={styles.linkToAccounts}>
            Accounts
          </Link>
        }
        className={styles.section}
      />
    );
  }

  if (transactions.length === 0 && queryAttempted) {
    return (
      <EmptyState
        message="No transactions found for the selected parameters."
        className={styles.section}
      />
    );
  }

  return (
    <section className={styles.section}>
      <h3>Transactions:</h3>
      {isFetchingCategories && <p>Loading categories...</p>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Merchant</th>
            <th style={{ textAlign: "right" }}>Amount</th>
            <th>Categories</th>
            <th>Assign</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              allCategories={categories}
              onLinkCategory={(transactionId, categoryId) =>
                assignMutation.mutate({ transactionId, categoryId })
              }
              onUnlinkCategory={(transactionId, categoryId) =>
                unlinkMutation.mutate({ transactionId, categoryId })
              }
            />
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default TransactionsSection;
