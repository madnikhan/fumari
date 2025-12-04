# Waiter Notification System Guide

## Overview

The buzzer display has been removed. Instead, each waiter assigned to specific tables will receive buzzer notifications on their phone.

---

## How It Works

### 1. Table Assignment

- Each table can be assigned to a specific waiter
- Assignment is done via the Tables Management system
- Waiters are assigned using the `assignedWaiterId` field on the Table model

### 2. Customer Request Flow

1. Customer scans QR code at their table
2. Customer clicks a service button (Call Waiter, Order Food, etc.)
3. Buzzer request is created in the database
4. **If the table has an assigned waiter**, the request appears in their notifications

### 3. Waiter Notifications

- Waiters access notifications at: `/dashboard/waiter/notifications`
- Only shows requests from tables assigned to that waiter
- Real-time updates every 3 seconds
- Mobile-optimized interface

---

## Setting Up Table Assignments

### Via Tables Management

1. Go to **Tables System** → **Table Map**
2. Click on a table
3. Assign a waiter from the dropdown
4. Save the assignment

### Via API

```typescript
// Assign waiter to table
PATCH /api/tables/{tableId}
{
  "assignedWaiterId": "waiter-staff-id"
}
```

---

## Waiter Access

### Mobile Notification Page

**URL:** `/dashboard/waiter/notifications`

**Features:**
- Shows all pending requests from assigned tables
- Color-coded by request type:
  - 🔔 Call Waiter (Red)
  - 🍽️ Order Food (Blue)
  - 💨 Order Shisha (Green)
  - 💳 Request Bill (Yellow)
  - 🔧 Table Service (Orange)
- Real-time updates (refreshes every 3 seconds)
- Action buttons:
  - **Acknowledge** - Mark request as acknowledged
  - **Complete** - Mark request as completed

### Navigation

- **Desktop:** "Notifications" link in top navigation bar
- **Mobile:** "Notifications" link in mobile menu
- **Direct URL:** `/dashboard/waiter/notifications`

---

## API Endpoints

### Get Waiter Notifications

```
GET /api/buzzer/waiter/notifications
```

**Authentication:** Required (waiter must be logged in)

**Response:**
```json
[
  {
    "id": "request-id",
    "tableId": "table-id",
    "requestType": "waiter",
    "status": "pending",
    "createdAt": "2024-01-01T12:00:00Z",
    "table": {
      "number": 5,
      "status": "occupied"
    }
  }
]
```

**Notes:**
- Only returns requests from tables assigned to the logged-in waiter
- Only shows pending requests
- Ordered by creation time (oldest first)

### Create Buzzer Request

```
POST /api/buzzer/request
{
  "tableId": "table-id",
  "requestType": "waiter" // waiter, food, shisha, bill, service
}
```

**Response includes:**
```json
{
  "waiterAssigned": true,
  "waiterName": "John Doe"
}
```

---

## Request Types

1. **waiter** - Call Waiter (Red)
2. **food** - Order Food (Blue)
3. **shisha** - Order Shisha (Green)
4. **bill** - Request Bill (Yellow)
5. **service** - Table Service (Orange)

---

## Workflow

### For Waiters:

1. **Login** to the system
2. **Open Notifications** page (`/dashboard/waiter/notifications`)
3. **View requests** from your assigned tables
4. **Acknowledge** when you're on your way
5. **Complete** when service is done

### For Customers:

1. **Scan QR code** at table
2. **Select service** needed
3. **Wait for waiter** - assigned waiter receives notification

---

## Benefits

✅ **Personalized** - Each waiter only sees requests from their tables  
✅ **Mobile-friendly** - Works on any smartphone  
✅ **Real-time** - Updates every 3 seconds  
✅ **Organized** - No need for big screen display  
✅ **Efficient** - Waiters can respond directly from their phone  

---

## Troubleshooting

### Waiter Not Receiving Notifications?

1. **Check table assignment:**
   - Go to Tables System
   - Verify table has `assignedWaiterId` set
   - Make sure it's assigned to the correct waiter

2. **Check waiter login:**
   - Waiter must be logged in
   - Session must be valid

3. **Check request status:**
   - Only pending requests are shown
   - Completed/acknowledged requests are hidden

4. **Check API response:**
   - Open browser console
   - Check `/api/buzzer/waiter/notifications` response
   - Verify it returns the requests

---

## Migration Notes

### Removed:
- ❌ `/dashboard/buzzer-display` - Big screen display page
- ❌ Navigation link to buzzer display

### Added:
- ✅ `/dashboard/waiter/notifications` - Waiter notification page
- ✅ `/api/buzzer/waiter/notifications` - Waiter notifications API
- ✅ Navigation link for waiters

### Still Works:
- ✅ Customer QR code scanning (`/table/[tableNumber]`)
- ✅ Buzzer request creation (`/api/buzzer/request`)
- ✅ QR code generation (`/dashboard/buzzer/qr-codes`)

---

**The system now sends notifications directly to waiters' phones instead of displaying on a big screen!** 📱

