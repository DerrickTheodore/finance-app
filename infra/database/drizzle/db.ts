import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import path, { dirname } from "path";
import { Pool } from "pg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

if (!process.env.DB_URL) {
  throw new Error("DB_URL is not set in .env file");
}

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

// Export the Drizzle instance
export const db = drizzle(pool);

// You can also export your schema if you define it here or import it
// For example, if you have schema.ts in the same directory:
// import * as schema from './schema';
// export const db = drizzle(pool, { schema });
