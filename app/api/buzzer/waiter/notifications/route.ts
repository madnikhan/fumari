import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getSessionFromRequest } from '@/lib/auth';

// Get buzzer notifications for logged-in waiter
export async function GET(request: Request) {
  try {
    // Get waiter session
    const session = await getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if this is a waiter login (session.userId is Staff ID)
    // For waiter login, session.userId directly contains the Staff ID
    // For regular user login, we need to find the Staff record
    
    let staffId: string | null = null;

    // Try to find Staff by ID first (waiter login)
    const staffById = await prisma.staff.findUnique({
      where: { id: session.userId },
      select: { id: true },
    });

    if (staffById) {
      // This is a waiter login - session.userId is Staff ID
      staffId = staffById.id;
    } else {
      // This is a regular user login - find Staff by email/name
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { email: true, username: true },
      });

      if (user) {
        // SQLite doesn't support 'mode: insensitive', so we'll search case-insensitively
        // by fetching all active staff and matching in JavaScript
        const allActiveStaff = await prisma.staff.findMany({
          where: {
            active: true,
          },
          select: {
            id: true,
            email: true,
            name: true,
          },
        });

        // Find matching staff (case-insensitive name match or email match)
        const staffByEmail = allActiveStaff.find(s => 
          (s.email && s.email.toLowerCase() === user.email?.toLowerCase()) ||
          s.name.toLowerCase().includes(user.username.toLowerCase())
        );

        if (staffByEmail) {
          staffId = staffByEmail.id;
        }
      }
    }

    if (!staffId) {
      // No staff record found - return empty notifications
      return NextResponse.json([]);
    }

    // Get waiter's assigned tables (tables where assignedWaiterId matches the Staff ID)
    const assignedTables = await prisma.table.findMany({
      where: {
        assignedWaiterId: staffId,
      },
      select: {
        id: true,
        number: true,
      },
    });

    // Get pending buzzer requests for waiter's assigned tables
    const tableIds = assignedTables.map(t => t.id);
    
    if (tableIds.length === 0) {
      return NextResponse.json([]);
    }

    const notifications = await prisma.buzzerRequest.findMany({
      where: {
        tableId: { in: tableIds },
        status: 'pending',
      },
      include: {
        table: {
          select: {
            number: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Oldest first
      },
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Error fetching waiter notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    );
  }
}

