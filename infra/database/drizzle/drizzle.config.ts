import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
import * as path from "path";
import { fileURLToPath } from "url";

var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);

const env_path = path.resolve(__dirname, "../../../.env");

dotenv.config({ path: env_path });
if (!process.env.DB_URL) {
  throw new Error("DB_URL is not set in .env file");
}

export default defineConfig({
  schema: "database/drizzle/schema/models.ts",
  out: "./database/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL,
  },
  verbose: true,
  strict: true,
});
