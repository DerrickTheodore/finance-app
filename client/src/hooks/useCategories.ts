import { getApiBaseUrl } from "@/lib/utils";
import { Category, NewCategory } from "@myfi/server/types";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

async function fetchCategoriesAPI(): Promise<Category[]> {
  const url = `${getApiBaseUrl()}/api/categories`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Network response was not ok");
  }
  return response.json();
}

async function createCategoryAPI(
  categoryData: Omit<NewCategory, "id" | "createdAt" | "updatedAt" | "userId">
): Promise<Category> {
  const url = `${getApiBaseUrl()}/api/categories`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Network response was not ok");
  }
  return response.json();
}

async function updateCategoryAPI({
  categoryId,
  categoryData,
}: {
  categoryId: number;
  categoryData: Partial<
    Omit<NewCategory, "id" | "createdAt" | "updatedAt" | "userId">
  >;
}): Promise<Category> {
  const url = `${getApiBaseUrl()}/api/categories/${categoryId}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Network response was not ok");
  }
  return response.json();
}

async function deleteCategoryAPI(
  categoryId: number
): Promise<{ message: string }> {
  const url = `${getApiBaseUrl()}/api/categories/${categoryId}`;
  const response = await fetch(url, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Network response was not ok");
  }
  return response.json();
}

export function useCategories() {
  return useSuspenseQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategoriesAPI,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation<
    Category,
    Error,
    Omit<NewCategory, "id" | "createdAt" | "updatedAt" | "userId">
  >({
    mutationFn: createCategoryAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation<
    Category,
    Error,
    {
      categoryId: number;
      categoryData: Partial<
        Omit<NewCategory, "id" | "createdAt" | "updatedAt" | "userId">
      >;
    }
  >({
    mutationFn: updateCategoryAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, number>({
    mutationFn: deleteCategoryAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
