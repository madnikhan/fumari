# 🎯 Visual Guide: Finding Your Supabase Connection String

## You're Currently Here:
- **Location:** Database → Schema Visualizer
- **What you see:** "No tables in schema" message

## Where You Need to Go:

### Step 1: Click the Settings Icon (Gear ⚙️)

Look at the **FAR LEFT sidebar** (the main navigation bar with icons):

```
┌─────────────────┐
│  🏠 Dashboard   │
│  📊 Table Editor│
│  💾 SQL Editor  │
│  📈 Reports     │
│  ⚡ API         │
│  👤 Auth        │
│  ☁️ Storage     │
│  ⚙️ Settings    │ ← CLICK THIS ONE!
│  📋 Logs        │
└─────────────────┘
```

**The Settings icon is in the MAIN left sidebar** (not the database sub-menu on the right).

### Step 2: After Clicking Settings

You'll see a settings menu. Look for:

```
Settings Menu:
├── General
├── API
├── Database        ← CLICK THIS!
├── Auth
├── Storage
└── ...
```

### Step 3: In Database Settings

Scroll down until you see:

```
┌─────────────────────────────────────────┐
│  Connection string                     │
│                                         │
│  [URI] [JDBC] [Golang] [Python] [etc]  │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ postgresql://postgres:[YOUR-      │ │
│  │ PASSWORD]@db.xxxxx.supabase.co:   │ │
│  │ 5432/postgres                     │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Copy] button                         │
└─────────────────────────────────────────┘
```

### Step 4: Get the Connection String

1. Make sure you're on the **"URI"** tab
2. Click the **"Copy"** button
3. The connection string will be copied to your clipboard

---

## Quick Navigation Path:

**Current Page:** Database → Schema Visualizer  
**Target Page:** Settings → Database → Connection string

**Steps:**
1. Look at **FAR LEFT sidebar** (main navigation)
2. Click **⚙️ Settings** icon (gear icon)
3. Click **"Database"** in the settings menu
4. Scroll down to **"Connection string"** section
5. Click **"URI"** tab
6. Click **"Copy"** button

---

## Still Can't Find It?

### Alternative Method:

1. Click **⚙️ Settings** (gear icon in far left sidebar)
2. Look for **"Connection string"** or **"Database URL"** in the settings
3. It might be under a different section - check all tabs in Settings

### If You See "Project URL" Instead:

The connection string is different from the Project URL:
- **Project URL:** `https://gzoalqqkdnhoaimltdyw.supabase.co` (for API)
- **Database Connection String:** `postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres` (for database)

You need the **Database Connection String**, not the Project URL!

---

## What the Connection String Looks Like:

```
postgresql://postgres:YOUR_PASSWORD_HERE@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres
```

**Important:** Replace `YOUR_PASSWORD_HERE` with your actual database password!

Then add `?sslmode=require` at the end:

```
postgresql://postgres:YOUR_PASSWORD_HERE@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres?sslmode=require
```

---

## Need Help?

If you still can't find it:
1. Make sure you're clicking **Settings** in the **FAR LEFT sidebar** (not database settings)
2. Look for "Connection string", "Database URL", or "Connection pooling"
3. Check if there are tabs or sections you need to expand

---

**Once you find it, copy it and we'll use it for Vercel deployment!** 🚀

