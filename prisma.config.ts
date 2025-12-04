import { defineConfig, env } from "prisma/config";
import { config } from "dotenv";
import path from "path";

// Explicitly load .env.local first
config({ path: ".env.local" });
// Then load .env as fallback
config();

// Determine database provider and URL
const getDatabaseConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  // If DATABASE_URL is explicitly set, use it (could be PostgreSQL for Vercel)
  if (databaseUrl) {
    // Check if it's a PostgreSQL URL (starts with postgresql:// or postgres://)
    if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
      return {
        provider: 'postgresql',
        url: databaseUrl,
        schema: 'prisma/schema.prisma',
      };
    }
    // If it's a file:// URL, use SQLite
    if (databaseUrl.startsWith('file:')) {
      // Convert relative paths to absolute
      let dbPath = databaseUrl;
      if (databaseUrl.startsWith('file:./') || databaseUrl.startsWith('file:../')) {
        const relativePath = databaseUrl.replace('file:', '');
        const absolutePath = path.join(process.cwd(), relativePath);
        dbPath = `file:${absolutePath}`;
      }
      return {
        provider: 'sqlite',
        url: dbPath,
        schema: 'prisma/schema.prisma',
      };
    }
  }
  
  // In production (Vercel), DATABASE_URL must be set (PostgreSQL)
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required in production/Vercel');
    }
    return {
      provider: 'postgresql',
      url: databaseUrl,
      schema: 'prisma/schema.prisma',
    };
  }
  
  // In local development, default to SQLite if DATABASE_URL not set
  const sqlitePath = `file:${path.join(process.cwd(), "dev.db")}`;
  console.log('[Prisma Config] Using SQLite for local development:', sqlitePath);
  return {
    provider: 'sqlite',
    url: sqlitePath,
    schema: 'prisma/schema.prisma',
  };
};

const dbConfig = getDatabaseConfig();

export default defineConfig({
  schema: dbConfig.schema,
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: dbConfig.url,
  },
});
