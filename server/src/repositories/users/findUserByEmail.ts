import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import { eq } from "@myfi/infra/database/drizzle/orm";
import { User, users } from "@myfi/infra/database/drizzle/schema/models";

export const findUserByEmail =
  (db: typeof defaultDb) =>
  async ({ email }: { email: string }): Promise<User | null> => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user || null;
  };
