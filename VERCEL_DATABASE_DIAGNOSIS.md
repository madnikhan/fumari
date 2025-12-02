# Vercel Database Error Diagnosis

## ✅ Good News

Your **local database connection works perfectly**:
- ✅ Connection string is correct
- ✅ Database tables exist
- ✅ Schema is in sync

## ❌ The Problem

The error happens **only on Vercel** (runtime), not during build. This means:

1. **Vercel's DATABASE_URL might be wrong** - Check Step 1 below
2. **Vercel needs redeployment** - After changing env vars, you MUST redeploy
3. **Connection pooling issue** - Supabase might be blocking Vercel IPs

---

## Step 1: Verify Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. **Copy the exact value** and compare with this:

   ```
   postgresql://postgres.iicsqunmzelpqvlotrna:Made!78601in@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
   ```

4. **Check these things:**
   - ✅ Starts with `postgresql://`
   - ✅ Has your password: `Made!78601in`
   - ✅ Ends with `?sslmode=require` (CRITICAL!)
   - ✅ No extra spaces or quotes
   - ✅ Environment is set to **"Production"** (or "Preview" if testing)

5. **If it's wrong:**
   - Click "Edit"
   - Paste the correct value
   - **Save**
   - **Redeploy** (see Step 2)

---

## Step 2: Redeploy Vercel

**IMPORTANT:** After changing environment variables, you MUST redeploy:

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for it to finish (2-3 minutes)
5. Try logging in again

---

## Step 3: Check Runtime Logs

After redeploying, check what error Vercel shows:

1. Go to **Logs** tab (not Deployments)
2. Make sure it says **"Runtime Logs"** (not Build Logs)
3. Try to log in to your app
4. Go back to Logs tab
5. Look for errors starting with:
   - `Database error:`
   - `P1001` (can't reach database)
   - `P2021` (table doesn't exist)
   - `P1000` (authentication failed)

**Copy the exact error message** and share it.

---

## Step 4: Check Supabase Connection Pooling

Your connection string uses **"pooler"** (`pooler.supabase.com`). This is correct, but sometimes Supabase blocks connections.

### Check Supabase Status:

1. Go to **Supabase Dashboard**
2. Click **"Project Settings"** (gear icon)
3. Check **"Database"** section
4. Look for:
   - ✅ Project status: **Active** (not paused)
   - ✅ Connection pooling: **Enabled**
   - ✅ Pool size: Should show a number

### If Project is Paused:

1. Click **"Resume"** or **"Restore"**
2. Wait 1-2 minutes
3. Try logging in again

---

## Step 5: Test Direct Connection (Alternative)

If pooler doesn't work, try **Direct Connection**:

1. Go to Supabase → **Project Settings** → **Database**
2. Find **"Connection string"** section
3. Select **"Direct connection"** (not Session mode)
4. Copy the connection string
5. It should look like:
   ```
   postgresql://postgres.iicsqunmzelpqvlotrna:Made!78601in@aws-1-us-east-2.connect.supabase.com:5432/postgres?sslmode=require
   ```
   (Notice: `connect.supabase.com` instead of `pooler.supabase.com`)

6. Update Vercel `DATABASE_URL` with this new string
7. **Redeploy**

---

## Common Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `P1001: Can't reach database` | Supabase paused or wrong URL | Resume Supabase project or check connection string |
| `P1000: Authentication failed` | Wrong password | Check password in connection string |
| `P2021: Table doesn't exist` | Tables not created | Run `npm run db:push` locally (already done ✅) |
| `Connection refused` | Wrong port or host | Check connection string format |
| No error, but login fails | Env var not set | Check Vercel environment variables |

---

## Quick Checklist

- [ ] Verified Vercel `DATABASE_URL` matches local `.env.local`
- [ ] `DATABASE_URL` ends with `?sslmode=require`
- [ ] Environment variable is set to "Production"
- [ ] Redeployed Vercel after changing env var
- [ ] Checked Supabase project is active (not paused)
- [ ] Checked Vercel Runtime Logs for exact error
- [ ] Tried Direct Connection if Pooler fails

---

## Next Steps

1. **Check Vercel Runtime Logs** (Step 3) - Get the exact error code
2. **Verify DATABASE_URL in Vercel** (Step 1) - Make sure it's correct
3. **Redeploy** (Step 2) - After any changes
4. **Share the error message** - So we can fix it

---

## Still Not Working?

If you've tried everything above:

1. **Share the exact error from Vercel Runtime Logs**
2. **Share a screenshot of Vercel Environment Variables** (hide the password)
3. **Confirm Supabase project is active**

Then we can diagnose further!

