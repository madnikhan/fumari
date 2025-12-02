# 🔗 How to Get Your Database Connection String

## What You Found:
✅ **Project URL:** `https://gzoalqqkdnhoaimltdyw.supabase.co`
- This is for the API, NOT the database connection!

## What We Need:
❌ **Database Connection String:** `postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres`

---

## Method 1: Find It in Supabase (Easiest)

### Step 1: Go to Project Settings
1. Click **⚙️ Settings** (gear icon) in the **FAR LEFT sidebar**
2. Click **"Database"** under **CONFIGURATION** section

### Step 2: Find Connection String
- Look for **"Connection string"** section
- Click **"URI"** tab
- Copy the string

---

## Method 2: Construct It Manually

If you can't find it in the UI, you can build it:

### You Need:
1. **Host:** `db.gzoalqqkdnhoaimltdyw.supabase.co` (add `db.` prefix to your project ID)
2. **Port:** `5432` (PostgreSQL default)
3. **Database:** `postgres` (default)
4. **Username:** `postgres` (default)
5. **Password:** The password you set when creating the Supabase project

### Format:
```
postgresql://postgres:YOUR_PASSWORD@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres?sslmode=require
```

### Example:
If your password is `MyPassword123`, it would be:
```
postgresql://postgres:MyPassword123@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres?sslmode=require
```

---

## Method 3: Get Password from Supabase

If you forgot your password:

1. Go to **⚙️ Settings** → **Database**
2. Find **"Database password"** section
3. Click **"Reset database password"**
4. Copy the new password
5. Use it in the connection string above

---

## Quick Reference:

**Your Project ID:** `gzoalqqkdnhoaimltdyw`

**Database Host:** `db.gzoalqqkdnhoaimltdyw.supabase.co`

**Connection String Template:**
```
postgresql://postgres:[YOUR_PASSWORD]@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres?sslmode=require
```

**Replace `[YOUR_PASSWORD]` with your actual database password!**

---

## Next Steps:

1. ✅ Get your database password (from Supabase or reset it)
2. ✅ Construct the connection string using the format above
3. ✅ Add `?sslmode=require` at the end
4. ✅ Use it in Vercel as `DATABASE_URL` environment variable

---

## Still Having Trouble?

Try this direct link to Database settings:
```
https://supabase.com/dashboard/project/gzoalqqkdnhoaimltdyw/settings/database
```

Then scroll down to find "Connection string" section.

