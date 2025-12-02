import { defineConfig, env } from "prisma/config";
import { config } from "dotenv";
import path from "path";

// Explicitly load .env.local first
config({ path: ".env.local" });
// Then load .env as fallback
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL || `file:${path.join(process.cwd(), "dev.db")}`,
  },
});
