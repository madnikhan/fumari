# Quick Supabase Setup (5 Minutes)

## 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com) → Sign up → New Project
- Name: `fumari-restaurant`
- Region: Choose closest (e.g., London for UK)
- Save your database password!

## 2. Get Connection String
- Settings → Database → Connection string → URI
- Copy the string
- Replace `[YOUR-PASSWORD]` with your actual password
- Add `?sslmode=require` at the end

Example:
```
postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

## 3. Update Prisma Schema
Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

## 4. Set Environment Variable

**Local (.env.local)**:
```
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
```

**Vercel** (Settings → Environment Variables):
- Add `DATABASE_URL` with your Supabase connection string

## 5. Setup Database
```bash
# Generate Prisma Client
npm run db:generate

# Create tables
npm run db:push

# Seed data
npm run db:seed
```

## 6. Test
```bash
npm run dev
```
Visit http://localhost:3000 and login with:
- Username: `admin`
- Password: `admin123`

## Done! ✅

Your database is now on Supabase and ready for production deployment.

For detailed instructions, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

