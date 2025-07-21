import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import { categories } from "@myfi/infra/database/drizzle/schema/models";
import type { Category } from "@myfi/infra/types";
import { eq } from "drizzle-orm";

export const getCategoriesByUserId =
  (db: typeof defaultDb) =>
  async (userId: number): Promise<Category[]> => {
    return db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(categories.name);
  };
