import { getApiBaseUrl } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlaidLinkOnSuccessMetadata } from "react-plaid-link";

async function exchangePublicTokenAPI(
  public_token: string,
  metadata: PlaidLinkOnSuccessMetadata
) {
  const response = await fetch(
    `${getApiBaseUrl()}/api/plaid/exchange-public-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_token, metadata }),
    }
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export function useExchangePublicToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      public_token,
      metadata,
    }: {
      public_token: string;
      metadata: PlaidLinkOnSuccessMetadata;
    }) => exchangePublicTokenAPI(public_token, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plaidItems"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
