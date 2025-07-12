import { getApiBaseUrl } from "@/lib/utils";
import { TransactionCategory } from "@myfi/server/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function assignCategoryAPI(transactionId: number, categoryId: number) {
  const url = `${getApiBaseUrl()}/api/transactions/${transactionId}/categories`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categoryId }),
  });
  if (!response.ok) {
    if (response.status === 401 && typeof window === "undefined") {
      // During build/prerender, just return a fallback for unauthorized
      return null;
    }
    const errorData = await response.text();
    throw new Error(errorData || "Failed to assign category");
  }
  return response.json();
}

async function unlinkCategoryAPI(transactionId: number, categoryId: number) {
  const url = `${getApiBaseUrl()}/api/transactions/${transactionId}/categories-unlink/${categoryId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    if (response.status === 401 && typeof window === "undefined") {
      // During build/prerender, just return a fallback for unauthorized
      return { message: "Unauthorized (build)" };
    }
    const errorData = await response.text();
    throw new Error(errorData || "Failed to unlink category");
  }
  return response.json();
}

export function useTransactionCategories() {
  const queryClient = useQueryClient();

  const assignMutation = useMutation<
    TransactionCategory,
    Error,
    {
      transactionId: number;
      categoryId: number;
      selectElement?: HTMLSelectElement;
    }
  >({
    mutationFn: ({ transactionId, categoryId }) =>
      assignCategoryAPI(transactionId, categoryId),
    onSuccess: (_, { selectElement }) => {
      queryClient.invalidateQueries({ queryKey: [["transactions"]] });
      if (selectElement) selectElement.value = "";
    },
  });

  const unlinkMutation = useMutation<
    { message: string },
    Error,
    { transactionId: number; categoryId: number }
  >({
    mutationFn: ({ transactionId, categoryId }) =>
      unlinkCategoryAPI(transactionId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["transactions"]] });
    },
  });

  return {
    assignMutation,
    unlinkMutation,
  };
}
