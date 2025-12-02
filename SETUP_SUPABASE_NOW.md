# Setup Supabase - Quick Steps

## Your Supabase Project
- **URL**: https://nnsqtbdlwbgytgbxqguf.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf

## Step 1: Get Connection String

1. Go to: https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf/settings/database
2. Scroll to **"Connection string"** section
3. Click **"URI"** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. Add `?sslmode=require` at the end

**Example format:**
```
postgresql://postgres:yourpassword@db.nnsqtbdlwbgytgbxqguf.supabase.co:5432/postgres?sslmode=require
```

## Step 2: Create .env.local File

Create a file named `.env.local` in the project root:

```bash
DATABASE_URL="postgresql://postgres:yourpassword@db.nnsqtbdlwbgytgbxqguf.supabase.co:5432/postgres?sslmode=require"
NODE_ENV="development"
```

**Replace `yourpassword` with your actual database password!**

## Step 3: Update Prisma Schema

The schema has been updated to use PostgreSQL. If you need to update it manually:

Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

## Step 4: Generate Prisma Client

```bash
npm run db:generate
```

## Step 5: Create Tables in Supabase

```bash
npm run db:push
```

This will create all tables in your Supabase database.

## Step 6: Seed Initial Data

```bash
npm run db:seed
```

This creates:
- Admin user (username: `admin`, password: `admin123`)
- Restaurant sections
- 50 tables
- Staff members
- Menu categories and items

## Step 7: Test Connection

```bash
npm run dev
```

Visit http://localhost:3000 and login with:
- Username: `admin`
- Password: `admin123`

## Step 8: Verify in Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf/editor
2. You should see all tables:
   - User
   - Table
   - MenuCategory
   - MenuItem
   - Order
   - etc.

## For Vercel Deployment

1. In Vercel Dashboard → Settings → Environment Variables
2. Add:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Supabase connection string (same as in .env.local)
   - **Environment**: Production, Preview, Development
3. Deploy!

## Troubleshooting

**Can't find password?**
- Go to Settings → Database → Database password
- You can reset it if needed

**Connection refused?**
- Make sure you added `?sslmode=require`
- Verify the password is correct
- Check that the connection string format is correct

**Migration errors?**
- Make sure `provider = "postgresql"` in schema.prisma
- Run `npm run db:generate` first
- Then run `npm run db:push`

