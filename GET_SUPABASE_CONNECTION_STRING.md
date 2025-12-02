# 🔗 How to Get Your Supabase Database Connection String

## Step-by-Step Instructions

### Step 1: Navigate to Database Settings

1. In your Supabase dashboard (where you are now)
2. Look at the **left sidebar** - you'll see icons for different sections
3. Click on the **"Settings"** icon (it looks like a gear ⚙️)
4. In the Settings menu, click on **"Database"**

### Step 2: Find Connection String

1. Scroll down to find the **"Connection string"** section
2. You'll see different tabs: **"URI"**, **"JDBC"**, **"Golang"**, etc.
3. Click on the **"URI"** tab (this is what we need!)

### Step 3: Copy the Connection String

You'll see something like this:

```
postgresql://postgres:[YOUR-PASSWORD]@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres
```

**Important Steps:**

1. **Click the "Copy" button** next to the connection string
2. **Replace `[YOUR-PASSWORD]`** with the password you created when setting up the Supabase project
   - This is the database password you set when creating the project
   - If you forgot it, you can reset it in Settings → Database → Database Password

3. **Add SSL requirement** at the end:
   - Add `?sslmode=require` to the end of the connection string
   - Final format should look like:
   ```
   postgresql://postgres:your-actual-password@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres?sslmode=require
   ```

### Step 4: Save It Securely

**Save this connection string** - you'll need it for:
- Vercel environment variables
- Local database setup commands

---

## Example Format

Your connection string should look like this (with your actual password):

```
postgresql://postgres:MySecurePassword123@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres?sslmode=require
```

**Breakdown:**
- `postgresql://` - Protocol
- `postgres` - Username (default)
- `:MySecurePassword123` - Your password (replace with yours!)
- `@db.gzoalqqkdnhoaimltdyw.supabase.co` - Database host
- `:5432` - Port (PostgreSQL default)
- `/postgres` - Database name
- `?sslmode=require` - SSL requirement (important for security!)

---

## If You Forgot Your Database Password

1. Go to **Settings** → **Database**
2. Scroll to **"Database Password"** section
3. Click **"Reset Database Password"**
4. Copy the new password
5. Update your connection string with the new password

---

## Next Steps

Once you have your connection string:

1. ✅ Copy it
2. ✅ Save it somewhere safe (password manager, notes app)
3. ✅ Use it in Vercel environment variables (as `DATABASE_URL`)
4. ✅ Use it for local database setup commands

---

## Quick Navigation Path

**Current Location:** API Page  
**Need to Go:** Settings → Database → Connection string → URI tab

**Visual Guide:**
```
Left Sidebar → ⚙️ Settings → Database → Scroll Down → Connection string → URI Tab
```

---

**Got it? Great! Now continue with the Vercel deployment guide!** 🚀

