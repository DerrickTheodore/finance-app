"use client";

import { useAuth } from "@/context/AuthContext";
import { PlaidItemWithAccounts } from "@myfi/server/types";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { useLinkedItems } from "../hooks/useLinkedItems";

interface StateContextType {
  selectedItem: PlaidItemWithAccounts | null;
  setSelectedItem: (item: PlaidItemWithAccounts | null) => void;
  selectedAccountIds: string[];
  setSelectedAccountIds: (accountIds: string[]) => void;
  handleSelectItem: (itemId: string) => void;
  handleAccountSelection: (accountId: string) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { linkedItems } = useLinkedItems(!!user);
  const [selectedItem, setSelectedItem] =
    useState<PlaidItemWithAccounts | null>(null);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  const handleSelectItem = useCallback(
    (itemId: string) => {
      const item = linkedItems.find((i) => i.plaidItemId === itemId) || null;
      setSelectedItem(item);
      setSelectedAccountIds([]);
    },
    [linkedItems]
  );

  const handleAccountSelection = useCallback((accountId: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  }, []);

  const value = {
    selectedItem,
    setSelectedItem,
    selectedAccountIds,
    setSelectedAccountIds,
    handleSelectItem,
    handleAccountSelection,
  };

  return (
    <StateContext.Provider value={value}>{children}</StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
