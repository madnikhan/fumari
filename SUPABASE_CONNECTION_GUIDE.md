# Supabase Connection Guide

## What You Have vs What You Need

### ✅ What You Have (API Key)
- **Project URL**: `https://nnsqtbdlwbgytgbxqguf.supabase.co`
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Use for**: Supabase REST API, Supabase Client Libraries (JavaScript/TypeScript)

### ❌ What You Need (Database Connection String)
- **For**: Prisma ORM to connect directly to PostgreSQL
- **Format**: `postgresql://postgres:password@host:port/database?sslmode=require`

## Get Database Connection String

### Step 1: Go to Database Settings
**Direct Link**: https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf/settings/database

### Step 2: Find Connection String Section
Scroll down to the **"Connection string"** section

### Step 3: Click "Connection pooling" Tab
- **DO NOT** use "URI" tab (port 5432 - may not work)
- **DO** click **"Connection pooling"** tab (port 6543 - recommended)

### Step 4: Copy Connection String
You'll see something like:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
```

### Step 5: Update .env.local

Replace `[YOUR-PASSWORD]` with your database password and URL encode special characters:

**Example:**
If your password is `Made!78601in`:
- URL encode `!` → `%21`
- Final password: `Made%2178601in`

**Full connection string:**
```bash
DATABASE_URL="postgresql://postgres.xxxxx:Made%2178601in@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require"
NODE_ENV="development"
```

### Step 6: Test Connection
```bash
npm run db:push
```

## Using Supabase Client (Alternative)

If you want to use Supabase's JavaScript client instead of Prisma, you can use:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nnsqtbdlwbgytgbxqguf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uc3F0YmRsd2JneXRnYnhxZ3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTU2MzksImV4cCI6MjA3OTA3MTYzOX0.gsD4RyUMC-tHKrPrRf39jbmEG4FlhbADUQfLoOtcp6g'

const supabase = createClient(supabaseUrl, supabaseKey)
```

**However**, your project is already set up to use **Prisma**, so you need the **database connection string**, not the API key.

## Quick Checklist

- [ ] Go to: https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf/settings/database
- [ ] Scroll to "Connection string"
- [ ] Click "Connection pooling" tab
- [ ] Copy connection string
- [ ] Replace `[YOUR-PASSWORD]` with your password
- [ ] URL encode special characters (`!` → `%21`)
- [ ] Add `?sslmode=require` at the end
- [ ] Update `.env.local` file
- [ ] Run `npm run db:push`

## Still Can't Find It?

The connection string should be in the same page where you found the API key:
- **Settings** → **Database** → **Connection string** → **Connection pooling** tab

Look for a string starting with `postgresql://postgres.` (not `https://`)

