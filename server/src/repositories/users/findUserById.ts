import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import { eq } from "@myfi/infra/database/drizzle/orm";
import { users } from "@myfi/infra/database/drizzle/schema/models";

export const findUserById =
  (db: typeof defaultDb) =>
  async ({ id }: { id: string }) => {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return null;
    }
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, numericId))
      .limit(1);
    return result[0];
  };
