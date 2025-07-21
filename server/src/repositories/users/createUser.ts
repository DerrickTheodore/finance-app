import { db as defaultDb } from "@myfi/infra/database/drizzle/db";
import { User, users } from "@myfi/infra/database/drizzle/schema/models";

export const createUser =
  (db: typeof defaultDb) =>
  async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<User> => {
    const [user] = await db
      .insert(users)
      .values({ email, password })
      .returning();
    return user;
  };
