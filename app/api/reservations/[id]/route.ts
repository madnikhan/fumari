import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

// Update reservation
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, tableId } = body;

    // First, get the current reservation to check table assignment
    const currentReservation = await prisma.reservation.findUnique({
      where: { id },
      select: { tableId: true, status: true },
    });

    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      
      // If confirming and table is assigned, mark table as reserved
      if (status === 'confirmed' && currentReservation?.tableId) {
        await prisma.table.update({
          where: { id: currentReservation.tableId },
          data: {
            status: 'reserved',
          },
        });
      }
      
      // If seating the reservation, update table status to occupied
      if (status === 'seated') {
        const tableToUpdate = tableId || currentReservation?.tableId;
        if (tableToUpdate) {
          await prisma.table.update({
            where: { id: tableToUpdate },
            data: {
              status: 'occupied',
            },
          });
        }
      }
      
      // If cancelling or completing, free up the table
      if ((status === 'cancelled' || status === 'completed') && currentReservation?.tableId) {
        await prisma.table.update({
          where: { id: currentReservation.tableId },
          data: {
            status: 'available',
          },
        });
      }
    }
    
    if (tableId !== undefined) {
      updateData.tableId = tableId;
      
      // If assigning a table, mark it as reserved
      if (tableId) {
        await prisma.table.update({
          where: { id: tableId },
          data: {
            status: 'reserved',
          },
        });
      }
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
      include: {
        table: {
          select: {
            number: true,
          },
        },
      },
    });

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to update reservation', details: error.message },
      { status: 500 }
    );
  }
}

// Delete reservation
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Free up the table if assigned
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      select: { tableId: true },
    });
    
    if (reservation?.tableId) {
      await prisma.table.update({
        where: { id: reservation.tableId },
        data: {
          status: 'available',
        },
      });
    }
    
    await prisma.reservation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { error: 'Failed to delete reservation', details: error.message },
      { status: 500 }
    );
  }
}

