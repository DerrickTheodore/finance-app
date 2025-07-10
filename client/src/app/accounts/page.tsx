"use client";

import { Suspense } from "react";
import AccountsSkeleton from "./AccountsSkeleton";
import AccountsView from "./AccountsView";

export default function AccountsPage() {
  return (
    <Suspense fallback={<AccountsSkeleton />}>
      <AccountsView />
    </Suspense>
  );
}
