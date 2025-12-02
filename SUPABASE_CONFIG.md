# Your Supabase Configuration

## Project Details
- **Project URL**: https://nnsqtbdlwbgytgbxqguf.supabase.co
- **Database Host**: `db.nnsqtbdlwbgytgbxqguf.supabase.co`

## Getting Your Connection String

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/nnsqtbdlwbgytgbxqguf
   - Or go to your project → Settings → Database

2. **Find Connection String**:
   - Scroll to **Connection string** section
   - Select **URI** tab
   - You'll see something like:
     ```
     postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
     ```
   - Or direct connection:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.nnsqtbdlwbgytgbxqguf.supabase.co:5432/postgres
     ```

3. **Replace `[YOUR-PASSWORD]`**:
   - Use the database password you set when creating the project
   - If you forgot it, you can reset it in Settings → Database → Database password

4. **Add SSL Mode**:
   - Add `?sslmode=require` at the end
   - Final format:
     ```
     postgresql://postgres:yourpassword@db.nnsqtbdlwbgytgbxqguf.supabase.co:5432/postgres?sslmode=require
     ```

## Recommended: Use Connection Pooling

For production, use the **Connection Pooling** connection string (port 6543):

1. In Supabase Dashboard → Settings → Database
2. Scroll to **Connection string**
3. Select **Connection pooling** tab
4. Copy the URI (it uses port 6543)
5. Replace password and add SSL:
   ```
   postgresql://postgres.xxxxx:yourpassword@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require
   ```

## Next Steps

1. Copy your connection string
2. Update `prisma/schema.prisma` to use PostgreSQL (see below)
3. Set `DATABASE_URL` in `.env.local` (local) and Vercel (production)
4. Run `npm run db:generate` and `npm run db:push`
5. Run `npm run db:seed` to populate initial data

