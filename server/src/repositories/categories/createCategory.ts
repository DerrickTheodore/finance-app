import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import {
  NewCategory,
  categories,
} from "@myfi/infra/database/drizzle/schema/models";
import type { Category } from "@myfi/infra/types";

export const createCategory =
  (db: typeof defaultDb) =>
  async (data: NewCategory): Promise<Category> => {
    const [newCategory] = await db.insert(categories).values(data).returning();
    if (!newCategory) {
      throw new Error("Failed to create category.");
    }
    return newCategory;
  };
