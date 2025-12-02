# ✅ Correct Connection String Format

## Your Session Pooler Connection String:

**Template (with brackets - DON'T USE THIS):**
```
postgresql://postgres.iicsqunmzelpqvlotrna:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```

**Correct Format (replace [YOUR-PASSWORD] with your actual password):**
```
postgresql://postgres.iicsqunmzelpqvlotrna:YOUR_ACTUAL_PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
```

---

## Steps:

1. **Get your database password:**
   - Go to Supabase → Database Settings
   - Find "Database password" section
   - Copy your password (or reset it if you forgot)

2. **Replace `[YOUR-PASSWORD]` with your actual password:**
   - Remove the brackets `[` and `]`
   - Put your password in that spot
   - Add `?sslmode=require` at the end

3. **Example:**
   - If password is `MyPass123`
   - Connection string: `postgresql://postgres.iicsqunmzelpqvlotrna:MyPass123@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require`

---

## Update .env.local:

Once you have your password, update `.env.local`:

```bash
DATABASE_URL="postgresql://postgres.iicsqunmzelpqvlotrna:YOUR_PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"
```

---

## Important Notes:

- ✅ **Remove brackets** - `[YOUR-PASSWORD]` becomes just your password
- ✅ **Add `?sslmode=require`** at the end (for security)
- ✅ **Username format:** `postgres.iicsqunmzelpqvlotrna` (includes project ID)
- ✅ **Host:** `aws-1-us-east-2.pooler.supabase.com` (Session Pooler)
- ✅ **Port:** `5432` (Session Pooler port)

---

**Once you have your password, replace `[YOUR-PASSWORD]` (without brackets) and add `?sslmode=require` at the end!** 🚀

