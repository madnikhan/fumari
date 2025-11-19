# Quick Start Checklist for Beginners

Follow these steps in order to get your restaurant management system running!

## ✅ Pre-Setup Checklist

- [ ] Node.js installed (check with `node --version`)
- [ ] Code editor installed (VS Code recommended)
- [ ] Terminal/Command Prompt ready

## ✅ Step 1: Initial Setup (5 minutes)

```bash
# Navigate to project folder
cd /Users/muhammadmadni/fumari

# Install all dependencies
npm install

# ✅ Check: Should see "added X packages"
```

**What this does:** Downloads all the tools your project needs

## ✅ Step 2: Database Setup (2 minutes)

```bash
# Generate Prisma Client (creates database code)
npm run db:generate

# ✅ Check: Should see "Generated Prisma Client"

# Create database tables
npm run db:push

# ✅ Check: Should see "Your database is now in sync"

# Add sample data
npm run db:seed

# ✅ Check: Should see "Seeding completed!"
```

**What this does:** 
- Creates your database
- Creates all tables (Staff, Tables, Menu, etc.)
- Adds 50 tables, staff members, and menu items

## ✅ Step 3: Start the Server (1 minute)

```bash
# Start development server
npm run dev

# ✅ Check: Should see "Ready on http://localhost:3000"
```

**What this does:** Starts your web server so you can view the app

## ✅ Step 4: Open in Browser

1. Open your browser
2. Go to: **http://localhost:3000**
3. ✅ You should see the home page!

## ✅ Step 5: Test Each Feature

### Test Tables Page
- [ ] Go to: http://localhost:3000/dashboard/tables
- [ ] ✅ Should see 50 tables listed
- [ ] ✅ Try clicking filter buttons (Available, Occupied, etc.)

### Test Menu Page
- [ ] Go to: http://localhost:3000/dashboard/menu
- [ ] ✅ Should see menu categories (Turkish Food, Kebabs, Cocktails, Shisha)
- [ ] ✅ Should see menu items with prices

### Test Staff Page
- [ ] Go to: http://localhost:3000/dashboard/staff
- [ ] ✅ Should see staff members (Managers, Waiters, Bartenders)

### Test Reservations Page
- [ ] Go to: http://localhost:3000/dashboard/reservations
- [ ] ✅ Should see reservations list (might be empty)
- [ ] ✅ Try clicking "New Reservation" button

### Test Orders Page
- [ ] Go to: http://localhost:3000/dashboard/orders
- [ ] ✅ Should see orders list (might be empty)

### Test Kitchen Page
- [ ] Go to: http://localhost:3000/dashboard/kitchen
- [ ] ✅ Should see kitchen display (might be empty)

### Test Analytics Page
- [ ] Go to: http://localhost:3000/dashboard/analytics
- [ ] ✅ Should see analytics dashboard

## ✅ Step 6: Make Your First Change

Let's change the home page title:

1. Open `app/page.tsx` in your code editor
2. Find the line: `<h1 className="text-5xl font-bold text-gray-900 mb-4">`
3. Change "Fumari Restaurant Management" to "My Restaurant"
4. Save the file
5. ✅ Check browser - title should update automatically!

## ✅ Step 7: Explore the Code

### Understand the Structure

1. **Frontend Pages**: `app/dashboard/*/page.tsx`
   - These are what users see
   - Try reading `app/dashboard/tables/page.tsx`

2. **API Routes**: `app/api/*/route.ts`
   - These handle data
   - Try reading `app/api/tables/route.ts`

3. **Database Schema**: `prisma/schema.prisma`
   - Defines your data structure
   - Try reading it to understand tables

## ✅ Common Issues & Solutions

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill

# Or use a different port
npm run dev -- -p 3001
```

### Issue: "Cannot find module"
**Solution:**
```bash
npm install
```

### Issue: "Database errors"
**Solution:**
```bash
npm run db:push
npm run db:seed
```

### Issue: "Changes not showing"
**Solution:**
1. Save all files
2. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
3. Check browser console for errors (F12)

## ✅ Learning Path

### Week 1: Understanding
- [ ] Read BEGINNER_GUIDE.md
- [ ] Explore the code structure
- [ ] Make small changes (colors, text)

### Week 2: Building
- [ ] Read STEP_BY_STEP.md
- [ ] Try building a simple feature
- [ ] Understand how API routes work

### Week 3: Advanced
- [ ] Read ARCHITECTURE.md
- [ ] Add a new feature
- [ ] Modify existing features

## ✅ Next Steps After Setup

1. **Customize the Menu**
   - Add your actual menu items
   - Update prices
   - Add images

2. **Configure Tables**
   - Match tables to your restaurant layout
   - Update sections
   - Set correct capacities

3. **Add Your Staff**
   - Add real staff members
   - Set up PIN codes
   - Assign roles

4. **Test the Workflow**
   - Create a reservation
   - Create an order
   - Update order status
   - View analytics

## ✅ Helpful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for errors
npm run lint

# Database commands
npm run db:generate  # Generate Prisma Client
npm run db:push      # Update database schema
npm run db:seed      # Add sample data
```

## ✅ Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

## ✅ Success Criteria

You've successfully set up the system when:
- ✅ Server runs without errors
- ✅ All pages load correctly
- ✅ You can see sample data
- ✅ You can make changes and see them update

## 🎉 Congratulations!

You've set up a complete restaurant management system! Now start exploring and building. Remember:

- **Don't be afraid to break things** - that's how you learn!
- **Read error messages** - they tell you what's wrong
- **Experiment** - try changing things and see what happens
- **Ask questions** - use the guides and documentation

Happy coding! 🚀

