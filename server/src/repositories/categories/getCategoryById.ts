import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import { categories } from "@myfi/infra/database/drizzle/schema/models";
import type { Category } from "@myfi/infra/types";
import { and, eq } from "drizzle-orm";

export const getCategoryById =
  (db: typeof defaultDb) =>
  async (id: number, userId: number): Promise<Category | null> => {
    const result = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .limit(1);
    return result[0] || null;
  };
