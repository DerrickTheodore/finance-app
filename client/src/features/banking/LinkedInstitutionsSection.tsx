import { PlaidItemWithAccounts } from "@myfi/server/types";
import React from "react";
import styles from "../../app/page.module.css";
import EmptyState from "../../components/EmptyState";

interface Props {
  linkedItems: PlaidItemWithAccounts[];
  fetchItemsError: string | null;
  selectedItem: PlaidItemWithAccounts | null;
  isDeletingItem: boolean;
  onSelectItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
}

const LinkedInstitutionsSection: React.FC<Props> = ({
  linkedItems,
  fetchItemsError,
  selectedItem,
  isDeletingItem,
  onSelectItem,
  onDeleteItem,
}) => (
  <section className={styles.section}>
    <h3>Your Linked Institutions:</h3>
    {fetchItemsError && (
      <p style={{ color: "red" }}>Error: {fetchItemsError}</p>
    )}
    {!fetchItemsError && linkedItems.length === 0 && (
      <EmptyState
        message="No bank accounts linked yet. Link an institution to get started."
        className={styles.section}
      />
    )}
    {!fetchItemsError && linkedItems.length > 0 && (
      <div className={styles.itemsList}>
        <h3>Your Linked Accounts:</h3>
        <ul>
          {linkedItems.map((item) => (
            <li key={item.plaidItemId} className={styles.itemEntry}>
              <button
                onClick={() => onSelectItem(item.plaidItemId)}
                className={
                  selectedItem?.plaidItemId === item.plaidItemId
                    ? styles.selectedItemButton
                    : styles.itemButton
                }
              >
                {item.plaidInstitutionName || "Unknown Institution"} (
                {item.plaidItemId})
              </button>
              <button
                onClick={() => onDeleteItem(item.plaidItemId)}
                disabled={isDeletingItem}
                className={styles.deleteItemButton}
              >
                {isDeletingItem ? "Deleting..." : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    )}
  </section>
);

export default LinkedInstitutionsSection;
