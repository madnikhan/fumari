import { PrismaClient } from '@prisma/client'
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

// Ensure absolute path for SQLite
if (process.env.DATABASE_URL?.startsWith('file:./')) {
  const relativePath = process.env.DATABASE_URL.replace('file:', '')
  const absolutePath = path.join(process.cwd(), relativePath)
  process.env.DATABASE_URL = `file:${absolutePath}`
}

// Validate DATABASE_URL in production
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required in production')
}

// Create Prisma client instance - don't override datasources, let it use DATABASE_URL from env
const createPrismaClient = () => {
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
    
    // Log DATABASE_URL status (without exposing the full URL)
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL)
      console.log(`[Prisma] Initializing with database: ${url.hostname}:${url.port}`)
    } else {
      console.error('[Prisma] DATABASE_URL is not set!')
    }
    
    return client
  } catch (error: any) {
    console.error('[Prisma] Failed to create PrismaClient:', error.message)
    throw error
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Handle Prisma Client disconnection on process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

