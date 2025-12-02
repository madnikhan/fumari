# 🔑 API Key vs Database Connection String

## What You Found:
❌ **API Key (JWT Token):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- This is for **API authentication** (Supabase client libraries)
- **NOT** what we need for database connection!

## What We Need:
✅ **Database Connection String:**
```
postgresql://postgres:password@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres?sslmode=require
```
- This is for **direct PostgreSQL connection** (Prisma, Vercel)
- This is what we need!

---

## How to Find the Database Connection String:

### Method 1: Direct Link (Easiest)

Go to this URL:
```
https://supabase.com/dashboard/project/gzoalqqkdnhoaimltdyw/settings/database
```

Then:
1. Scroll down to **"Connection string"** section
2. Click **"URI"** tab
3. Copy the connection string

### Method 2: Manual Navigation

1. Click **⚙️ Settings** (gear icon) in **FAR LEFT sidebar**
2. Click **"Database"** under **CONFIGURATION** section
3. Scroll down to **"Connection string"**
4. Click **"URI"** tab
5. Copy the string

---

## What the Connection String Looks Like:

It should start with `postgresql://` and look like:

```
postgresql://postgres:[YOUR-PASSWORD]@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres
```

**NOT** like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ❌ (This is API key)
```

---

## Quick Comparison:

| Type | Format | Use Case |
|------|--------|----------|
| **API Key** | `eyJhbGci...` (JWT token) | Supabase client libraries, API calls |
| **Connection String** | `postgresql://...` | Direct database connection, Prisma, Vercel |

---

## If You Can't Find It:

You can construct it manually:

1. **Get your database password:**
   - Go to Settings → Database
   - Find "Database password" section
   - If you forgot it, click "Reset database password"

2. **Build the connection string:**
   ```
   postgresql://postgres:YOUR_PASSWORD@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres?sslmode=require
   ```

3. **Replace `YOUR_PASSWORD`** with your actual password

---

## Next Steps:

1. ✅ Go to the database settings page (link above)
2. ✅ Find "Connection string" section
3. ✅ Copy the URI connection string
4. ✅ Use it in Vercel as `DATABASE_URL`

---

**The connection string should start with `postgresql://` NOT `eyJhbGci...`!**

