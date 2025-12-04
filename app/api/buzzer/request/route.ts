import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, requestType } = body;

    // Validate required fields
    if (!tableId) {
      return NextResponse.json(
        { error: 'Table ID is required' },
        { status: 400 }
      );
    }

    if (!requestType) {
      return NextResponse.json(
        { error: 'Request type is required' },
        { status: 400 }
      );
    }

    // Validate request type
    const validTypes = ['waiter', 'food', 'shisha', 'bill', 'service'];
    if (!validTypes.includes(requestType)) {
      return NextResponse.json(
        { error: `Invalid request type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify table exists and get assigned waiter
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        assignedWaiter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Create buzzer request
    const buzzerRequest = await prisma.buzzerRequest.create({
      data: {
        tableId,
        requestType,
        status: 'pending',
      },
      include: {
        table: {
          select: {
            number: true,
            status: true,
            assignedWaiter: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // If table has assigned waiter, the notification will be shown on their phone
    // The waiter can view notifications at /dashboard/waiter/notifications

    return NextResponse.json({
      ...buzzerRequest,
      waiterAssigned: !!table.assignedWaiter,
      waiterName: table.assignedWaiter?.name || null,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating buzzer request:', error);
    return NextResponse.json(
      { error: 'Failed to create buzzer request', details: error.message },
      { status: 500 }
    );
  }
}

