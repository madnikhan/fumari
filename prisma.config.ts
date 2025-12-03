import { defineConfig, env } from "prisma/config";
import { config } from "dotenv";
import path from "path";

// Explicitly load .env.local first
config({ path: ".env.local" });
// Then load .env as fallback
config();

// In production, DATABASE_URL must be set (no fallback to SQLite)
// In development, fallback to SQLite if DATABASE_URL is not set
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Only fallback to SQLite in development
  if (process.env.NODE_ENV !== 'production') {
    return `file:${path.join(process.cwd(), "dev.db")}`;
  }
  
  // In production, throw error if DATABASE_URL is not set
  throw new Error('DATABASE_URL environment variable is required in production');
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: getDatabaseUrl(),
  },
});
