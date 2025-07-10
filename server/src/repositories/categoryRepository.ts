import { db } from "@myfi/infra/database/drizzle/db";
import {
  NewCategory,
  categories,
} from "@myfi/infra/database/drizzle/schema/models";
import type { Category } from "@myfi/infra/types"; // Import Category from shared types
import { and, eq } from "drizzle-orm";

export async function createCategory(data: NewCategory): Promise<Category> {
  const [newCategory] = await db.insert(categories).values(data).returning();
  if (!newCategory) {
    throw new Error("Failed to create category.");
  }
  return newCategory;
}

export async function getCategoryById(
  id: number,
  userId: number
): Promise<Category | null> {
  const result = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .limit(1);
  return result[0] || null;
}

export async function getCategoriesByUserId(
  userId: number
): Promise<Category[]> {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.name);
}

export async function updateCategory(
  id: number,
  userId: number,
  data: Partial<Omit<NewCategory, "id" | "userId" | "createdAt" | "updatedAt">> // Use Omit to exclude base fields
): Promise<Category | null> {
  const [updatedCategory] = await db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning();
  return updatedCategory || null;
}

export async function deleteCategory(
  id: number,
  userId: number
): Promise<Category | null> {
  // Note: Consider implications of deleting a category that's linked to transactions.
  // You might want to un-link them first or handle it based on your application's logic.
  // For now, this will delete the category. Cascading deletes on the join table should handle the links.
  const [deletedCategory] = await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning();
  return deletedCategory || null;
}
