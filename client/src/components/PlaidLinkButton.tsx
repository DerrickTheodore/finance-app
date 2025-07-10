"use client";

import { getApiBaseUrl } from "@/lib/utils";
import React, { useCallback, useEffect, useState } from "react";
import {
  PlaidLinkError,
  PlaidLinkOnEventMetadata,
  PlaidLinkOnExitMetadata,
  PlaidLinkOnSuccessMetadata,
  PlaidLinkOptions,
  usePlaidLink,
} from "react-plaid-link";
import { useAuth } from "../context/AuthContext";

interface PlaidLinkButtonProps {
  onItemsLinked?: () => void; // Callback for when items are successfully linked
}

const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({ onItemsLinked }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const { user } = useAuth();
  const [errorState, setErrorState] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchLinkToken = useCallback(async () => {
    if (!user) {
      setErrorState("Please log in to link your bank account.");
      return;
    }
    setIsLoading(true);
    setErrorState(null);
    setSuccessMessage(null);
    try {
      const url = `${getApiBaseUrl()}/api/plaid/create-link-token`;
      const response = await fetch(url, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.text();
        setErrorState(errorData || "Failed to initialize Plaid Link.");
        return;
      }
      const data = await response.json();
      if (!data.link_token) {
        setErrorState("Failed to retrieve a valid link token from the server.");
        setLinkToken(null);
      } else {
        setLinkToken(data.link_token);
      }
    } catch (error) {
      setErrorState(
        "An unexpected error occurred while initializing Plaid Link."
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Fetch link token only if user is present and token is not already fetched
    if (user && !linkToken && !isLoading) {
      fetchLinkToken();
    }
    // If user logs out, clear token and messages
    if (!user) {
      setLinkToken(null);
      setErrorState(null);
      setSuccessMessage(null);
    }
  }, [user, linkToken, fetchLinkToken, isLoading]);

  const handleOnSuccess = useCallback(
    async (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => {
      setIsLoading(true);
      setErrorState(null);
      setSuccessMessage(null);
      try {
        const url = `${getApiBaseUrl()}/api/plaid/exchange-public-token`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ public_token, metadata }),
        });
        if (!response.ok) {
          const errorData = await response.text();
          setErrorState(errorData || "Failed to exchange public token.");
          return;
        }
        const successData = await response.json();
        setSuccessMessage(
          successData.message || "Bank account linked successfully!"
        );
        if (onItemsLinked) {
          onItemsLinked();
        }
      } catch (error) {
        setErrorState(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while communicating with the server."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onItemsLinked]
  );

  const handleOnExit = useCallback(
    (error: PlaidLinkError | null, metadata: PlaidLinkOnExitMetadata) => {
      console.log("Plaid Link exited:", error, metadata);
      if (error) {
        if (error.error_code === "INVALID_LINK_TOKEN") {
          setErrorState(
            "Link session expired or was invalid. Please try again."
          );
          setLinkToken(null); // Invalidate current token
          fetchLinkToken(); // Attempt to refetch
        } else {
          // setErrorState(error.display_message || error.error_message || "Plaid Link was closed.");
          // Avoid setting error if user simply closes the modal without an error
          if (
            (metadata && metadata.status === "requires_credentials") ||
            metadata.status === "choose_device"
          ) {
            // User is still in the flow, do nothing or provide specific guidance
          } else if (error.error_code !== "USER_CANCELLED") {
            // Don't show error if user just cancelled
            setErrorState(
              error.display_message ||
                error.error_message ||
                "Plaid Link was closed."
            );
          }
        }
      }
    },
    [fetchLinkToken]
  );

  const handleOnEvent = (
    eventName: string,
    metadata: PlaidLinkOnEventMetadata
  ) => {
    console.log("Plaid Link event:", eventName, metadata);
    // Handle other Plaid Link events as needed
    // For example, you might want to track specific events for analytics
    // or provide UI feedback for certain transitions.
    // if (eventName === 'TRANSITION_VIEW' && metadata.view_name === 'CONSENT') {
    //   console.log('User is on the consent pane');
    // }
  };

  const config: PlaidLinkOptions = {
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: handleOnExit,
    onEvent: handleOnEvent,
  };

  const { open, ready, error: plaidLinkError } = usePlaidLink(config);

  useEffect(() => {
    if (plaidLinkError) {
      console.error("PlaidLink hook error:", plaidLinkError);
      // Type assertion for PlaidLinkError - be cautious with this if structure isn't guaranteed
      const errorObj = plaidLinkError as unknown as PlaidLinkError;
      setErrorState(
        errorObj?.display_message || // Added optional chaining
          errorObj?.error_message || // Added optional chaining
          (plaidLinkError instanceof Error
            ? plaidLinkError.message
            : "Plaid Link component error.")
      );
      // Attempt to re-fetch link token if it seems to be the issue
      if (
        errorObj?.error_code === "INVALID_LINK_TOKEN" ||
        (plaidLinkError instanceof Error &&
          plaidLinkError.message?.includes("invalid link_token"))
      ) {
        setLinkToken(null);
        fetchLinkToken();
      }
    }
  }, [plaidLinkError, fetchLinkToken]);

  if (!user) {
    return <p>Please log in to link your bank account.</p>;
  }

  return (
    <div>
      <button
        onClick={() => {
          setErrorState(null); // Clear previous errors before opening
          setSuccessMessage(null); // Clear previous success messages
          open();
        }}
        disabled={!ready || !linkToken || isLoading}
      >
        {isLoading
          ? "Loading..."
          : linkToken
          ? "Link Bank Account"
          : "Initializing..."}
      </button>
      {errorState && <p style={{ color: "red" }}>Error: {errorState}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

export default PlaidLinkButton;
