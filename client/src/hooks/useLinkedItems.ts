import { getApiBaseUrl } from "@/lib/utils";
import {
  MessageResponse,
  PlaidItemModel,
  PlaidItemWithAccounts,
} from "@myfi/server/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const fetchLinkedItemsData = async (): Promise<PlaidItemWithAccounts[]> => {
  const url = `${getApiBaseUrl()}/api/plaid/items`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 401 && typeof window === "undefined") {
      // During build/prerender, just return empty data for unauthorized
      return [];
    }
    const errorData = await response.text();
    throw new Error(errorData || "Failed to fetch linked accounts");
  }
  const responseData = await response.json();
  return responseData.plaidItems || [];
};

async function deleteItemAPI(itemPlaidId: string): Promise<MessageResponse> {
  const url = `${getApiBaseUrl()}/api/plaid/items/${itemPlaidId}`;
  const response = await fetch(url, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `Failed to delete item ${itemPlaidId}`);
  }
  return response.json();
}

export function useLinkedItems(enabled: boolean = true) {
  const queryClient = useQueryClient();

  const { data: linkedItems } = useQuery({
    queryKey: ["linkedItems"],
    queryFn: fetchLinkedItemsData,
    enabled,
  });

  const refetchLinkedItems = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["linkedItems"] });
  }, [queryClient]);

  const setLinkedItems = (newItems: PlaidItemModel[]) => {
    queryClient.setQueryData(["linkedItems"], newItems);
  };

  return { linkedItems: linkedItems || [], refetchLinkedItems, setLinkedItems };
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation<MessageResponse, Error, string>({
    mutationFn: deleteItemAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkedItems"] });
    },
  });
}
