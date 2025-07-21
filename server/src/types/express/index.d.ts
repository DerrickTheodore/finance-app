// /Users/derricktheodore/app-library/finance-app/server/src/types/express/index.d.ts
import type { db } from "@myfi/infra/database/drizzle/db";
import type { User } from "@myfi/infra/database/drizzle/schema/models";

type AuthenticatedRequestUser = Partial<
  Omit<User, "id" | "createdAt" | "updatedAt" | "password"> & { id: string }
>;

declare global {
  namespace Express {
    export interface Request extends Request<{ plaidItemId?: string }> {
      db?: typeof db;
      user?: AuthenticatedRequestUser;
    }
  }
}
