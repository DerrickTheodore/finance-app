import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env" });

if (!process.env.DB_URL) {
  throw new Error("DB_URL is not set in .env file");
}

export default defineConfig({
  schema: "../../infra/schema.ts",
  out: "../../infra/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL,
  },
  verbose: true,
  strict: true,
});
