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

    // Find the Staff record for this User (match by email or username)
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, username: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find Staff member by email or name matching username
    const staff = await prisma.staff.findFirst({
      where: {
        OR: [
          { email: user.email },
          { name: { contains: user.username, mode: 'insensitive' } },
        ],
        active: true,
      },
      select: {
        id: true,
      },
    });

    if (!staff) {
      // No staff record found for this user - return empty notifications
      return NextResponse.json([]);
    }

    // Get waiter's assigned tables (tables where assignedWaiterId matches the Staff ID)
    const assignedTables = await prisma.table.findMany({
      where: {
        assignedWaiterId: staff.id,
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

