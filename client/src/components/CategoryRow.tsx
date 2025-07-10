import { Category } from "@myfi/server/types";
import React from "react";

interface CategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
  isDeleting: boolean;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  onEdit,
  onDelete,
  isDeleting,
}) => (
  <tr key={category.id}>
    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
      {category.name}
    </td>
    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
      {category.color ? (
        <span
          style={{
            backgroundColor: category.color,
            padding: "2px 8px",
            borderRadius: "4px",
            color: "#fff",
          }}
        >
          {category.color}
        </span>
      ) : (
        "N/A"
      )}
    </td>
    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
      {category.icon || "N/A"}
    </td>
    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
      <button
        onClick={() => onEdit(category)}
        className="text-indigo-600 hover:text-indigo-900 mr-3"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(category.id)}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-900"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </td>
  </tr>
);

export default CategoryRow;
