import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import path, { dirname } from "path";
import { Pool } from "pg";
import { fileURLToPath } from "url";

var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);

const env_path = path.resolve(__dirname, "../../../.env");

dotenv.config({ path: env_path });

if (!process.env.DB_URL) {
  throw new Error("DB_URL is not set in .env file");
}
const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export const db = drizzle(pool, { logger: true });
