# Supabase Connection Fix

## Issue
The connection string is being read, but Prisma can't reach the database server.

## Solutions

### Option 1: Use Connection Pooling (Recommended)

Supabase recommends using connection pooling for better performance and reliability.

1. Go to: https://supabase.com/dashboard/project/nnsqtbdlwgbxqguf/settings/database
2. Scroll to **"Connection string"**
3. Click **"Connection pooling"** tab (NOT "URI")
4. Copy the connection string (uses port 6543)
5. Replace `[YOUR-PASSWORD]` with your password
6. Add `?sslmode=require` at the end

**Format:**
```
postgresql://postgres.xxxxx:yourpassword@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require
```

### Option 2: URL Encode Password

If your password contains special characters (like `!`, `@`, `#`, etc.), they need to be URL encoded.

**Special characters in password:**
- `!` becomes `%21`
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- `%` becomes `%25`
- `&` becomes `%26`
- `*` becomes `%2A`
- `(` becomes `%28`
- `)` becomes `%29`
- `+` becomes `%2B`
- `=` becomes `%3D`

**Example:**
If password is `Made!78601in`, URL encoded it becomes `Made%2178601in`

**Updated connection string:**
```
postgresql://postgres:Made%2178601in@db.nnsqtbdlwbgytgbxqguf.supabase.co:5432/postgres?sslmode=require
```

### Option 3: Reset Database Password

If connection still fails:

1. Go to Supabase Dashboard → Settings → Database
2. Click **"Reset database password"**
3. Set a new password (avoid special characters or URL encode them)
4. Update `.env.local` with new password

## Test Connection

After updating `.env.local`, test the connection:

```bash
npm run db:push
```

If successful, you'll see:
```
✔ Your database is now in sync with your Prisma schema.
```

Then seed:
```bash
npm run db:seed
```

