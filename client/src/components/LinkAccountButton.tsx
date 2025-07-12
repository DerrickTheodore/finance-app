"use client";

import { useCreateLinkToken } from "@/hooks/useCreateLinkToken";
import { useExchangePublicToken } from "@/hooks/useExchangePublicToken";
import { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";

export default function LinkAccountButton() {
  const {
    mutate: createLinkToken,
    data: linkToken,
    isPending: isCreatingLinkToken,
    isSuccess: isLinkTokenCreated,
  } = useCreateLinkToken();

  const { mutate: exchangePublicToken, isPending: isExchangingPublicToken } =
    useExchangePublicToken();

  const { open, ready } = usePlaidLink({
    token: isLinkTokenCreated ? linkToken : null,
    onSuccess: (public_token, metadata) => {
      exchangePublicToken({
        public_token,
        metadata,
      });
    },
  });

  useEffect(() => {
    if (ready && isLinkTokenCreated) {
      open();
    }
  }, [ready, isLinkTokenCreated, open]);

  return (
    <button
      onClick={() => createLinkToken()}
      disabled={isCreatingLinkToken || isExchangingPublicToken}
    >
      Link New Account
    </button>
  );
}
