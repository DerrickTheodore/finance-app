import LinkAccountButton from "@/components/LinkAccountButton";
import type { PlaidAccount as Account } from "@myfi/server/types";
import React from "react";
import styles from "../../app/page.module.css";
import EmptyState from "../../components/EmptyState";

interface Props {
  accounts: Account[];
  selectedAccountIds: string[];
  onAccountSelect: (accountId: string) => void;
  institutionName?: string | null;
}

const AccountSelectionSection: React.FC<Props> = ({
  accounts,
  selectedAccountIds,
  onAccountSelect,
  institutionName,
}) => {
  if (!accounts || accounts.length === 0) {
    return (
      <EmptyState
        message="No accounts found for this institution. Please link an account to get started."
        className={styles.section}
        action={<LinkAccountButton />}
      />
    );
  }

  return (
    <section className={styles.section}>
      <h4>Accounts for {institutionName || "Selected Institution"}:</h4>
      <div className={styles.checkboxGroup}>
        {accounts.map((account) => (
          <div key={account.id} className={styles.checkboxItem}>
            <input
              type="checkbox"
              id={`account-${account.id}`}
              value={account.id}
              checked={selectedAccountIds.includes(account.id)}
              onChange={() => onAccountSelect(account.id)}
            />
            <label htmlFor={`account-${account.id}`}>
              {account.name || account.id}
            </label>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AccountSelectionSection;
