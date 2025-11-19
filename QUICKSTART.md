# Quick Start Guide

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up database:**
   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Create database and tables
   npm run db:push

   # Seed initial data (sections, tables, staff, menu items)
   npm run db:seed
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## What's Included

The seed script creates:

- **4 Sections**: Main Hall, Shisha Lounge, Bar Area, Outdoor Terrace
- **50 Tables**: Distributed across sections
- **Staff Members**: 
  - 1 Manager
  - 10 Waiters
  - 5 Bartenders
- **Menu Categories**:
  - Turkish Food
  - Kebabs
  - Mezes & Appetizers
  - Cocktails
  - Shisha
- **Menu Items**: Sample Turkish dishes, cocktails, and shisha flavors

## Default Credentials

Staff members use PIN codes for quick login:
- Manager: PIN `0000`
- Waiters: PIN `1001` - `1010`
- Bartenders: PIN `2001` - `2005`

## Next Steps

1. **Customize Menu**: Add your actual menu items via the Menu Management page
2. **Add More Tables**: Create tables matching your restaurant layout
3. **Configure Staff**: Add your actual staff members
4. **Set Up Sections**: Adjust sections to match your restaurant layout

## Key Features to Explore

- **Table Management**: View and manage all tables in real-time
- **Reservations**: Create and track customer reservations
- **POS System**: Create orders for tables
- **Kitchen Display**: Real-time order queue for kitchen/bar
- **Analytics**: View sales reports and popular items
- **Staff Management**: Manage staff members and assignments

## Troubleshooting

If you encounter issues:

1. **Database errors**: Run `npm run db:push` to sync schema
2. **Missing data**: Run `npm run db:seed` again (it uses upsert, so safe to run multiple times)
3. **Build errors**: Check that all dependencies are installed with `npm install`

