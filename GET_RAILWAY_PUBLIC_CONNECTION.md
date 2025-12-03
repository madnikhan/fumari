# Get Railway Public Connection String

## ⚠️ Important: You Need the PUBLIC Connection String

The connection string you have uses `postgres.railway.internal` - this is **internal only** and won't work from Vercel or your local machine.

You need the **PUBLIC** connection string instead.

---

## ✅ How to Get Public Connection String

### Option 1: From Railway Dashboard (Easiest)

1. In Railway dashboard, click on your **PostgreSQL** service
2. Click the **"Connect"** tab (next to Variables)
3. You'll see **"Public Network"** section
4. Copy the connection string from there

It should look like:
```
postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:5432/railway
```

**Note:** The hostname will be `containers-XXX.railway.app` (not `postgres.railway.internal`)

---

### Option 2: From Variables Tab

1. Click on **PostgreSQL** service
2. Click **"Variables"** tab
3. Look for `DATABASE_URL` or `PGHOST`
4. The public hostname should be shown there

---

### Option 3: Manual Construction

If you can't find it, you can construct it manually:

1. In Railway dashboard → PostgreSQL service → **"Settings"** tab
2. Find **"Public Networking"** section
3. Note the **public hostname** (e.g., `containers-us-west-123.railway.app`)
4. Construct connection string:
   ```
   postgresql://postgres:SfXpiFXqDoIvrKNEaqOjxQAUDciijHUF@PUBLIC-HOSTNAME:5432/railway
   ```

Replace `PUBLIC-HOSTNAME` with the actual hostname from Railway.

---

## ✅ Enable Public Networking (If Not Enabled)

If you don't see a public connection string:

1. Go to PostgreSQL service → **"Settings"** tab
2. Scroll to **"Networking"** section
3. Enable **"Public Networking"** (toggle it on)
4. Wait 30 seconds
5. The public hostname will appear

---

## 🔍 How to Identify Public vs Internal

- ❌ **Internal:** `postgres.railway.internal:5432` (won't work from Vercel)
- ✅ **Public:** `containers-XXX.railway.app:5432` (works from anywhere)

---

**Once you have the public connection string, share it and I'll help you set it up!** 🚀

