import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

// Auto-assign table based on party size and availability
export async function POST(request: Request) {
  try {
    const { reservationId, partySize, reservationTime } = await request.json();

    if (!reservationId || !partySize || !reservationTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find available tables that can accommodate the party
    const availableTables = await prisma.table.findMany({
      where: {
        status: 'available',
        capacity: {
          gte: parseInt(partySize),
        },
      },
      orderBy: {
        capacity: 'asc', // Prefer smaller tables that fit
      },
    });

    if (availableTables.length === 0) {
      return NextResponse.json(
        { error: 'No available tables for this party size', available: false },
        { status: 404 }
      );
    }

    // Check for time conflicts - don't assign tables that are reserved at the same time
    const reservationDateTime = new Date(reservationTime);
    const reservationStart = new Date(reservationDateTime);
    reservationStart.setHours(reservationDateTime.getHours() - 1); // 1 hour before
    const reservationEnd = new Date(reservationDateTime);
    reservationEnd.setHours(reservationDateTime.getHours() + 2); // 2 hours after

    const conflictingReservations = await prisma.reservation.findMany({
      where: {
        tableId: { in: availableTables.map(t => t.id) },
        reservationTime: {
          gte: reservationStart,
          lte: reservationEnd,
        },
        status: {
          in: ['pending', 'confirmed'],
        },
      },
      select: {
        tableId: true,
      },
    });

    const conflictingTableIds = new Set(conflictingReservations.map(r => r.tableId).filter(Boolean));
    const suitableTables = availableTables.filter(t => !conflictingTableIds.has(t.id));

    if (suitableTables.length === 0) {
      return NextResponse.json(
        { error: 'No tables available at this time', available: false },
        { status: 404 }
      );
    }

    // Assign the first suitable table
    const assignedTable = suitableTables[0];

    // Update reservation with table assignment
    const reservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        tableId: assignedTable.id,
        status: 'confirmed',
      },
      include: {
        table: {
          select: {
            number: true,
            capacity: true,
          },
        },
      },
    });

    // Mark table as reserved
    await prisma.table.update({
      where: { id: assignedTable.id },
      data: {
        status: 'reserved',
      },
    });

    return NextResponse.json({
      reservation,
      table: {
        id: assignedTable.id,
        number: assignedTable.number,
        capacity: assignedTable.capacity,
      },
    });
  } catch (error: any) {
    console.error('Error assigning table:', error);
    return NextResponse.json(
      { error: 'Failed to assign table', details: error.message },
      { status: 500 }
    );
  }
}

