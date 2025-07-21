"use client";

import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import CategoryForm from "../components/CategoryForm";
import CategoryRow from "../components/CategoryRow";
import EmptyState from "../components/EmptyState";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../hooks/useCategories";
import { Category } from "types";

const CategoriesManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const { user } = useAuth();
  // Only call useCategories if user is present (for Suspense safety)
  const categoriesResult = useCategories();
  const categories = categoriesResult.data || [];
  const isLoading = categoriesResult.isLoading;
  const error = categoriesResult.error;
  const deleteCategoryMutation = useDeleteCategory();

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const handleSaveCategory = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (categoryId: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  if (!user) return null;
  if (isLoading)
    return <p className="text-center py-4">Loading categories...</p>;
  if (error && !showForm) {
    return (
      <p className="text-red-500 bg-red-100 p-3 rounded text-center">
        Error: {error.message}
      </p>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Categories</h1>

      {showForm ? (
        <CategoryForm
          category={editingCategory}
          onSave={handleSaveCategory}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          isSaving={
            createCategoryMutation.isPending || updateCategoryMutation.isPending
          }
        />
      ) : (
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCategory(null);
          }}
          className="mb-4 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Add New Category
        </button>
      )}

      {deleteCategoryMutation.error && (
        <p className="text-red-500 bg-red-100 p-3 rounded text-center my-2">
          Error deleting category: {deleteCategoryMutation.error.message}
        </p>
      )}

      {!showForm && categories.length === 0 && !isLoading && (
        <EmptyState
          message="No categories found. Add one to get started!"
          className="text-gray-600"
        />
      )}

      {!showForm && categories.length > 0 && (
        <div className="mt-6 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Color
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Icon
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {categories.map((category) => (
                    <CategoryRow
                      key={category.id}
                      category={category}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isDeleting={deleteCategoryMutation.isPending}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManager;
