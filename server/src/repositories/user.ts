import { db } from "@myfi/infra/database/drizzle/db";
import { eq } from "@myfi/infra/database/drizzle/orm";
import { users } from "@myfi/infra/database/drizzle/schema/models";

// Renamed from findUser to findUserByEmail
export async function findUserByEmail({ email }: { email: string }) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0];
}

// New function to find a user by their ID
export async function findUserById({ id }: { id: string }) {
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    // Handle cases where ID might not be a valid number, though JWT should ensure it is.
    return null;
  }
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, numericId)) // Use the converted numericId
    .limit(1);
  return result[0];
}

export async function createUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const [user] = await db.insert(users).values({ email, password }).returning();
  return user;
}
