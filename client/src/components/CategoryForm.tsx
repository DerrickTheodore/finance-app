import { Category, NewCategory } from "@myfi/server/types";
import React, { useState } from "react";
import { useCreateCategory, useUpdateCategory } from "../hooks/useCategories";

interface CategoryFormProps {
  category?: Category | null;
  onSave: (category: Category) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [name, setName] = useState(category?.name || "");
  const [color, setColor] = useState(category?.color || "");
  const [icon, setIcon] = useState(category?.icon || "");

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryData = {
      name,
      color: color || null,
      icon: icon || null,
    };

    if (category?.id) {
      updateCategoryMutation.mutate(
        { categoryId: category.id, categoryData },
        {
          onSuccess: (savedCategory) => {
            onSave(savedCategory);
          },
        }
      );
    } else {
      createCategoryMutation.mutate(categoryData as NewCategory, {
        onSuccess: (savedCategory) => {
          onSave(savedCategory);
        },
      });
    }
  };

  const mutationError =
    createCategoryMutation.error || updateCategoryMutation.error;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border rounded-lg shadow-md bg-white"
    >
      <h2 className="text-xl font-semibold">
        {category?.id ? "Edit" : "Create"} Category
      </h2>
      {mutationError && (
        <p className="text-red-500 bg-red-100 p-2 rounded">
          {mutationError.message}
        </p>
      )}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name*
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="color"
          className="block text-sm font-medium text-gray-700"
        >
          Color (hex, e.g., #RRGGBB)
        </label>
        <input
          id="color"
          type="text"
          value={color || ""}
          onChange={(e) => setColor(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="icon"
          className="block text-sm font-medium text-gray-700"
        >
          Icon (e.g., emoji or icon name)
        </label>
        <input
          id="icon"
          type="text"
          value={icon || ""}
          onChange={(e) => setIcon(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Category"}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
