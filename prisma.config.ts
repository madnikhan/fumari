import { defineConfig, env } from "prisma/config";
import "dotenv/config";
import path from "path";

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
