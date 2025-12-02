# Step-by-Step: Get Supabase Connection String

## Step 1: Open Database Settings
**Click this link**: https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf/settings/database

## Step 2: Find Connection String Section
Scroll down the page until you see a section called **"Connection string"**

## Step 3: Click "Connection pooling" Tab
- You'll see multiple tabs: "URI", "JDBC", "Connection pooling", etc.
- **Click the "Connection pooling" tab** (NOT "URI")
- This uses port **6543** which is more reliable

## Step 4: Copy the Connection String
You'll see a connection string that looks like:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
```

**Copy this entire string** (you can click the copy button or select and copy)

## Step 5: What to Look For
The connection string should:
- ✅ Start with `postgresql://postgres.`
- ✅ Contain `pooler.supabase.com`
- ✅ End with `:6543/postgres` (port 6543)
- ✅ Have `[YOUR-PASSWORD]` placeholder

## Step 6: Share the Connection String
Once you copy it, share it with me (you can hide the password part if you want) and I'll help you:
1. Update your `.env.local` file
2. URL encode the password properly
3. Test the connection

## What If You Don't See "Connection pooling" Tab?
- Make sure you're on the **Settings → Database** page
- Try refreshing the page
- If still not visible, use the "URI" tab as a fallback (but pooling is better)

## Quick Checklist
- [ ] Opened database settings page
- [ ] Found "Connection string" section
- [ ] Clicked "Connection pooling" tab
- [ ] Copied the connection string
- [ ] Ready to share/update

