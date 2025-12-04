# Login Troubleshooting Guide

## Understanding the 401 Unauthorized Error

A **401 Unauthorized** error means the login credentials are incorrect or the user account doesn't exist.

---

## Two Different Login Systems

### 1. Regular Login (`/login`) - For Admins/Managers
- **URL:** `http://localhost:3000/login`
- **Uses:** Username + Password
- **For:** User accounts (admin, manager, staff)
- **API:** `/api/auth/login`

### 2. Waiter Login (`/waiter-login`) - For Waiters
- **URL:** `http://localhost:3000/waiter-login`
- **Uses:** Name + PIN
- **For:** Staff records (waiters)
- **API:** `/api/auth/waiter-login`

---

## Common Issues & Solutions

### Issue 1: Using Wrong Login Page

**Symptom:** 401 error when trying to login as waiter

**Solution:** Use `/waiter-login` instead of `/login`

- ❌ Wrong: `http://localhost:3000/login` (for User accounts)
- ✅ Correct: `http://localhost:3000/waiter-login` (for Staff PIN)

---

### Issue 2: Invalid Username/Password (Regular Login)

**Symptom:** 401 error on `/api/auth/login`

**Check:**
1. Verify User account exists:
   ```sql
   SELECT id, username, email, role, active FROM User;
   ```

2. Default admin credentials:
   - Username: `admin`
   - Password: `admin123` (if seeded)

3. Check if user is active:
   ```sql
   SELECT active FROM User WHERE username = 'admin';
   ```
   - Should be `1` (true)

**Solution:**
- Create User account if doesn't exist
- Reset password if forgotten
- Ensure user is active

---

### Issue 3: Invalid Name/PIN (Waiter Login)

**Symptom:** 401 error on `/api/auth/waiter-login`

**Check:**
1. Verify Staff record exists:
   ```sql
   SELECT id, name, pin, role, active FROM Staff WHERE name LIKE '%waiter%';
   ```

2. Check Staff name (case-insensitive, partial match):
   - Name: `waiter 2` or `Waiter 2` ✅
   - PIN: `1002` ✅

3. Check if Staff is active:
   ```sql
   SELECT active FROM Staff WHERE name LIKE '%waiter 2%';
   ```
   - Should be `1` (true)

**Solution:**
- Verify Staff name matches exactly (case-insensitive)
- Verify PIN matches exactly
- Ensure Staff is active

---

### Issue 4: Password Not Hashed

**Symptom:** Login fails even with correct password

**Check:**
```sql
SELECT password FROM User WHERE username = 'admin';
```

**Solution:**
- Password should be hashed (starts with `$2a$` or `$2b$`)
- If plain text, hash it:
  ```javascript
  const bcrypt = require('bcryptjs');
  const hashed = await bcrypt.hash('admin123', 10);
  ```

---

## Quick Fixes

### Fix 1: Create Admin User

```bash
# Via API
POST /api/users
{
  "username": "admin",
  "email": "admin@fumari.com",
  "password": "admin123",
  "role": "admin"
}
```

### Fix 2: Reset Admin Password

```sql
-- Hash password: admin123
UPDATE User SET password = '$2a$10$...' WHERE username = 'admin';
```

### Fix 3: Check Staff PIN

```sql
SELECT name, pin FROM Staff WHERE role = 'waiter';
```

---

## Testing Login

### Test Regular Login:
1. Go to: `http://localhost:3000/login`
2. Enter:
   - Username: `admin`
   - Password: `admin123`
3. Should redirect to `/dashboard/tables`

### Test Waiter Login:
1. Go to: `http://localhost:3000/waiter-login`
2. Enter:
   - Name: `waiter 2`
   - PIN: `1002`
3. Should redirect to `/dashboard/waiter/notifications`

---

## Debug Steps

1. **Check browser console:**
   - Open DevTools → Console
   - Look for error messages
   - Check Network tab → See API response

2. **Check server logs:**
   - Look at terminal where `npm run dev` is running
   - Check for error messages

3. **Verify database:**
   ```sql
   -- Check Users
   SELECT * FROM User;
   
   -- Check Staff
   SELECT * FROM Staff;
   ```

4. **Test API directly:**
   ```bash
   # Regular login
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   
   # Waiter login
   curl -X POST http://localhost:3000/api/auth/waiter-login \
     -H "Content-Type: application/json" \
     -d '{"name":"waiter 2","pin":"1002"}'
   ```

---

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `401 Unauthorized` | Invalid credentials | Check username/password or name/PIN |
| `Invalid username or password` | User not found or wrong password | Verify User account exists |
| `Invalid name or PIN` | Staff not found or wrong PIN | Verify Staff record exists |
| `User not found` | User account doesn't exist | Create User account |
| `Staff not found` | Staff record doesn't exist | Create Staff record |

---

## Still Having Issues?

1. **Clear browser cookies:**
   - DevTools → Application → Cookies → Delete `session` cookie

2. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Check database connection:**
   ```bash
   npm run db:push
   ```

4. **Verify environment variables:**
   - Check `.env.local` has correct `DATABASE_URL`

---

**Remember:** Waiters use `/waiter-login` with Name + PIN, not `/login` with Username + Password!

