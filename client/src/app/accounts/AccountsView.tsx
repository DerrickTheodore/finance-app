"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useAppState } from "../../context/AppStateContext";
import AccountSelectionSection from "../../features/banking/AccountSelectionSection";
import LinkedInstitutionsSection from "../../features/banking/LinkedInstitutionsSection";
import { useDeleteItem, useLinkedItems } from "../../hooks/useLinkedItems";
import styles from "../page.module.css";

export default function AccountsView() {
  const { user, isLoading: authLoading } = useAuth();
  const { linkedItems } = useLinkedItems(!!user);
  const { mutate: deleteItem, isPending: isDeletingItem } = useDeleteItem();

  const {
    selectedItem,
    handleSelectItem,
    selectedAccountIds,
    handleAccountSelection,
    setSelectedItem,
  } = useAppState();

  useEffect(() => {
    if (!selectedItem && linkedItems.length > 0) {
      setSelectedItem(linkedItems[0]);
    }
  }, [linkedItems, selectedItem, setSelectedItem]);

  const handleDeleteItem = async (itemPlaidId: string) => {
    deleteItem(itemPlaidId, {
      onSuccess: () => {
        if (selectedItem?.plaidItemId === itemPlaidId) {
          setSelectedItem(null);
        }
      },
      onError: (error) => {
        console.error("Error deleting item:", error);
      },
    });
  };

  if (authLoading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Accounts</h1>
        <LinkedInstitutionsSection
          linkedItems={linkedItems}
          fetchItemsError={null} // Error is now handled by Suspense/ErrorBoundary
          selectedItem={selectedItem}
          isDeletingItem={isDeletingItem}
          onSelectItem={handleSelectItem}
          onDeleteItem={handleDeleteItem}
        />
        {selectedItem &&
          selectedItem.accounts &&
          selectedItem.accounts.length > 0 && (
            <AccountSelectionSection
              accounts={selectedItem.accounts || []}
              selectedAccountIds={selectedAccountIds}
              onAccountSelect={handleAccountSelection}
              institutionName={selectedItem.plaidInstitutionName}
            />
          )}
      </main>
    </div>
  );
}
