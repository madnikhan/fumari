# 🎯 EXACT Location of Connection String

## You Are Here:
✅ Project Settings → **General settings** (you're on this page)

## What You Need to Do:

### Look at the LEFT SUB-MENU (under "Project Settings" title)

You should see a menu on the LEFT side with these options:

```
PROJECT SETTINGS
├── General settings          ← YOU ARE HERE
├── Compute and Disk
├── Infrastructure
├── Integrations
├── Data API
├── API Keys
├── JWT Keys
├── Log Drains
├── Add Ons
├── Vault (BETA)

CONFIGURATION
├── Database                 ← CLICK THIS ONE! ⬅️
├── Authentication
├── Storage
└── Edge Functions
```

### Step-by-Step:

1. **Look at the LEFT side menu** (not the far-left sidebar, but the menu under "Project Settings")
2. **Scroll down** to see the "CONFIGURATION" section
3. **Click "Database"** (it's under CONFIGURATION)
4. **Scroll down** on that Database page
5. You'll see **"Connection string"** section
6. Click the **"URI"** tab
7. **Copy** the connection string

---

## Alternative: Direct URL

If you can't find it, try going directly to:

```
https://supabase.com/dashboard/project/gzoalqqkdnhoaimltdyw/settings/database
```

Just replace the part after `/settings/` with `database`

---

## What You'll See on Database Page:

Once you click "Database" in the sub-menu, you'll see:

```
Database Settings
├── Connection string
│   ├── [URI] [JDBC] [Golang] [Python] [Node.js] [etc]
│   └── postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
│       [Copy] button
├── Connection pooling
├── Database password
└── ...
```

---

## Still Can't Find It?

Try this:

1. In the **same sub-menu** (left side under Project Settings)
2. Look for **"Connection pooling"** - sometimes it's there
3. Or look for **"Database"** under **"CONFIGURATION"** section

---

## Quick Visual Guide:

```
Current Page:
┌─────────────────────────────────────┐
│ Project Settings                     │
│                                      │
│ [General] ← You are here            │
│ [Database] ← Click this!            │
│ [Authentication]                     │
└─────────────────────────────────────┘
```

**The "Database" option is in the LEFT sub-menu, NOT the far-left sidebar!**

postgresql://postgres:Made!78601in@db.gzoalqqkdnhoaimltdyw.supabase.co:5432/postgres?sslmode=require