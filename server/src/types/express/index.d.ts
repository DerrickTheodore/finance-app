// /Users/derricktheodore/app-library/finance-app/server/src/types/express/index.d.ts
import type { db } from "@myfi/infra/database/drizzle/db";

declare global {
  namespace Express {
    export interface Request {
      db: typeof db;
      userId?: string; // Assuming userId might also be attached to request, e.g., by auth middleware
    }
  }
}
