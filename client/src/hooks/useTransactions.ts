import { getApiBaseUrl } from "@/lib/utils";
import { TransactionWithCategories } from "@myfi/server/types";
import { useSuspenseQuery } from "@tanstack/react-query";

async function fetchTransactionsAPI(params: {
  plaidItemId?: string;
  accountIds: string[];
  startDate: string;
  endDate: string;
}) {
  if (!params.plaidItemId || params.accountIds.length === 0) {
    return [];
  }
  const urlParams = new URLSearchParams({
    plaidItemId: params.plaidItemId,
    startDate: params.startDate,
    endDate: params.endDate,
  });
  params.accountIds.forEach((id) => urlParams.append("account_ids[]", id));
  const url = `${getApiBaseUrl()}/api/plaid/transactions?${urlParams.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 401 && typeof window === "undefined") {
      // During build/prerender, just return empty data for unauthorized
      return [];
    }
    const errorData = await response.text();
    throw new Error(errorData || "Failed to fetch transactions");
  }
  const data = await response.json();
  return data as TransactionWithCategories[];
}

export function useTransactions(params: {
  plaidItemId?: string;
  accountIds: string[];
  startDate: string;
  endDate: string;
}) {
  const { plaidItemId, accountIds, startDate, endDate } = params;
  return useSuspenseQuery<TransactionWithCategories[], Error>({
    queryKey: ["transactions", plaidItemId, accountIds, startDate, endDate],
    queryFn: () =>
      fetchTransactionsAPI({ plaidItemId, accountIds, startDate, endDate }),
  });
}
