import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import {
  NewCategory,
  categories,
} from "@myfi/infra/database/drizzle/schema/models";
import type { Category } from "@myfi/infra/types";
import { and, eq } from "drizzle-orm";

export const updateCategory =
  (db: typeof defaultDb) =>
  async (
    id: number,
    userId: number,
    data: Partial<
      Omit<NewCategory, "id" | "userId" | "createdAt" | "updatedAt">
    >
  ): Promise<Category | null> => {
    const [updatedCategory] = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return updatedCategory || null;
  };
