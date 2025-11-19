import { PrismaClient } from './prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure DATABASE_URL is set correctly
// In production, DATABASE_URL should be set via environment variables (PostgreSQL)
// In development, fallback to SQLite if not set
if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
  const dbPath = path.join(process.cwd(), 'dev.db')
  process.env.DATABASE_URL = `file:${dbPath}`
}

// Validate DATABASE_URL in production
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required in production')
}

// Create Prisma client instance - don't override datasources, let it use DATABASE_URL from env
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

