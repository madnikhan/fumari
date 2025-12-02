# 🔗 Get Correct Connection String from Supabase

## What I See:

1. **Project ID:** `iicsqunmzelpqvlotrna` (different from before)
2. **IPv4 Warning:** "Not IPv4 compatible" - Need to use Session Pooler!

---

## Step 1: Switch to Session Pooler

On the Supabase page you're viewing:

1. Look for the **"Method"** dropdown
2. Change it from **"Direct connection"** to **"Session Pooler"**
3. This will give you an IPv4-compatible connection string

---

## Step 2: Get Your Password

1. On the same page, look for **"Reset your database password"** section at the bottom
2. Click **"Database Settings"** link
3. Find **"Database password"** section
4. If you don't know it, click **"Reset database password"**
5. Copy the password

---

## Step 3: Build Connection String

Once you have:
- Session Pooler connection string (from Step 1)
- Your database password (from Step 2)

The format should be:
```
postgresql://postgres:YOUR_PASSWORD@db.iicsqunmzelpqvlotrna.supabase.co:6543/postgres?sslmode=require
```

**Notice:**
- Port is `6543` (Session Pooler) not `5432` (Direct)
- Host: `db.iicsqunmzelpqvlotrna.supabase.co`
- Database: `postgres`
- Add `?sslmode=require` at the end

---

## Step 4: Update .env.local

Update your `.env.local` file with the correct connection string:

```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.iicsqunmzelpqvlotrna.supabase.co:6543/postgres?sslmode=require"
```

---

## Step 5: Try Database Setup Again

```bash
cd /Users/muhammadmadni/fumari

# Generate Prisma Client
npm run db:generate

# Create tables
npm run db:push

# Add initial data
npm run db:seed
```

---

## Important Notes:

- ✅ **Use Session Pooler** (not Direct connection) for IPv4 compatibility
- ✅ **Port 6543** (Session Pooler) instead of 5432
- ✅ **Project ID:** `iicsqunmzelpqvlotrna`
- ✅ Make sure Supabase project is **active** (not paused)

---

**Switch to Session Pooler and get the connection string, then we'll update it!** 🚀

