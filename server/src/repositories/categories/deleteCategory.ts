import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import { categories } from "@myfi/infra/database/drizzle/schema/models";
import type { Category } from "@myfi/infra/types";
import { and, eq } from "drizzle-orm";

export const deleteCategory =
  (db: typeof defaultDb) =>
  async (id: number, userId: number): Promise<Category | null> => {
    const [deletedCategory] = await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return deletedCategory || null;
  };
