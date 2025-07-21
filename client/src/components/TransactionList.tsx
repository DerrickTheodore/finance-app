import React from "react";
import TransactionRow from "./TransactionRow";

interface TransactionListProps {
  transactions: any[];
  allCategories: any[];
  onLinkCategory: (transactionId: number, categoryId: number) => void;
  onUnlinkCategory: (transactionId: number, categoryId: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  allCategories,
  onLinkCategory,
  onUnlinkCategory,
  isLoading,
  error,
}) => {
  if (isLoading) return <p>Loading transactions...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!transactions || transactions.length === 0) {
    return <p>No transactions found.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: "600px",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Date
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Name
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Merchant
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                textAlign: "right",
              }}
            >
              Amount
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Categories
            </th>
            <th
              style={{
                border: "1px solid #ddd",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              allCategories={allCategories}
              onLinkCategory={onLinkCategory}
              onUnlinkCategory={onUnlinkCategory}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
