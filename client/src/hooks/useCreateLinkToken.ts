import { getApiBaseUrl } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

async function createLinkTokenAPI() {
  const response = await fetch(
    `${getApiBaseUrl()}/api/plaid/create-link-token`,
    {
      method: "POST",
    }
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data.link_token;
}

export function useCreateLinkToken() {
  return useMutation({
    mutationFn: createLinkTokenAPI,
  });
}
