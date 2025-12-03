# Fix Supabase Database Connection on Vercel

## Error
```
Can't reach database server at `aws-1-us-east-2.pooler.supabase.com:5432`
```

## Possible Causes

### 1. Supabase Project is Paused (Most Common)
Free tier Supabase projects pause after inactivity.

**Fix:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Find your project
3. If it shows "Paused" or "Inactive", click **"Resume"** or **"Restore"**
4. Wait 1-2 minutes for it to start
5. Try logging in again

### 2. Connection String Missing `?sslmode=require`
Vercel needs SSL mode specified.

**Check:**
1. Go to Vercel → Settings → Environment Variables
2. Find `DATABASE_URL`
3. Make sure it ends with `?sslmode=require`

**Should be:**
```
postgresql://postgres.iicsqunmzelpqvlotrna:Made!78601in@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
```

### 3. Wrong Connection String
Make sure you're using the **Connection Pooling** string, not Direct connection.

**Get Correct String:**
1. Go to Supabase → Project Settings → Database
2. Under "Connection string", select **"Session mode"** (pooler)
3. Copy the connection string
4. Make sure it has `pooler.supabase.com` (not `connect.supabase.com`)
5. Add `?sslmode=require` at the end
6. Update in Vercel → Environment Variables
7. Redeploy

### 4. Database Tables Don't Exist
If the project was paused/resumed, tables might need to be recreated.

**Fix:**
Run locally:
```bash
npm run db:push
npm run db:seed
```

Then verify in Supabase Table Editor that tables exist.

## Quick Checklist

- [ ] Supabase project is **Active** (not paused)
- [ ] `DATABASE_URL` in Vercel ends with `?sslmode=require`
- [ ] Using **pooler** connection (not direct)
- [ ] Connection string is correct
- [ ] Tables exist in Supabase
- [ ] Redeployed Vercel after changing env vars

## Test Connection

After fixing, test by:
1. Try logging in
2. Check Vercel Runtime Logs for connection errors
3. If still failing, check Supabase Dashboard → Database → Connection Pooling status
