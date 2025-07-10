"use client";

import { Suspense } from "react";
import TransactionsSkeleton from "./TransactionsSkeleton";
import TransactionsView from "./TransactionsView";

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsSkeleton />}>
      <TransactionsView />
    </Suspense>
  );
}
