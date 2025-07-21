interface TransactionRowProps {
  transaction: any;
  allCategories: any[];
  onLinkCategory: (transactionId: any, categoryId: any) => void;
  onUnlinkCategory: (transactionId: any, categoryId: any) => void;
}

import React from "react";

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  allCategories,
  onLinkCategory,
  onUnlinkCategory,
}: TransactionRowProps) => {
  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState<string>("");

  const handleLinkCategory = () => {
    if (selectedCategoryId) {
      onLinkCategory(transaction.id, parseInt(selectedCategoryId, 10));
      setSelectedCategoryId("");
    }
  };

  return (
    <tr key={transaction.id}>
      <td>{transaction.date}</td>
      <td>{transaction.name}</td>
      <td>{transaction.merchantName}</td>
      <td style={{ textAlign: "right" }}>
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: transaction.isoCurrencyCode || "USD",
        }).format(parseFloat(transaction.amount))}
      </td>
      <td>
        {transaction.categories?.map((cat: any) => (
          <span
            key={cat.id}
            style={{
              backgroundColor: cat.color || "#eee",
              color: cat.color ? "white" : "black",
              padding: "2px 6px",
              borderRadius: "4px",
              marginRight: "4px",
              fontSize: "0.9em",
            }}
          >
            {cat.name}
            <button
              onClick={() => onUnlinkCategory(transaction.id, cat.id)}
              style={{
                marginLeft: "4px",
                border: "none",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
          </span>
        ))}
      </td>
      <td>
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          style={{ marginRight: "5px", padding: "5px" }}
        >
          <option value="">Assign Category</option>
          {allCategories
            .filter(
              (cat: any) =>
                !transaction.categories?.find(
                  (linkedCat: any) => linkedCat.id === cat.id
                )
            )
            .map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </select>
        <button
          onClick={handleLinkCategory}
          disabled={!selectedCategoryId}
          style={{ padding: "5px 10px" }}
        >
          Assign
        </button>
      </td>
    </tr>
  );
};

export default TransactionRow;
