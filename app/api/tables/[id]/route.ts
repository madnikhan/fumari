import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

// Update table
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, currentGuests, assignedWaiterId } = body;

    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (currentGuests !== undefined) {
      updateData.currentGuests = parseInt(currentGuests);
    }

    if (assignedWaiterId !== undefined) {
      updateData.assignedWaiterId = assignedWaiterId || null;
    }

    const table = await prisma.table.update({
      where: { id },
      data: updateData,
      include: {
        section: true,
        assignedWaiter: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(table);
  } catch (error: any) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { error: 'Failed to update table', details: error.message },
      { status: 500 }
    );
  }
}

// Get single table
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        section: true,
        assignedWaiter: {
          select: {
            name: true,
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

    return NextResponse.json(table);
  } catch (error: any) {
    console.error('Error fetching table:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table', details: error.message },
      { status: 500 }
    );
  }
}

