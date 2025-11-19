import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let where: any = {};
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.reservationTime = {
        gte: startDate,
        lte: endDate,
      };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        table: {
          select: {
            number: true,
          },
        },
      },
      orderBy: {
        reservationTime: 'asc',
      },
    });

    // Always return an array, even if empty
    return NextResponse.json(Array.isArray(reservations) ? reservations : []);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    // Return empty array with 200 status to prevent client-side errors
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      partySize,
      reservationTime,
      tableId,
      specialRequests,
    } = body;

    // Validate required fields
    if (!customerName || !customerPhone || !partySize || !reservationTime) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, customerPhone, partySize, reservationTime' },
        { status: 400 }
      );
    }

    // Build data object, only including fields that are provided
    const reservationData: any = {
      customerName,
      customerPhone,
      partySize: parseInt(partySize),
      reservationTime: new Date(reservationTime),
      status: 'pending',
    };

    // Add optional fields only if they exist
    if (customerEmail) {
      reservationData.customerEmail = customerEmail;
    }
    if (tableId) {
      reservationData.tableId = tableId;
    }
    if (specialRequests) {
      reservationData.specialRequests = specialRequests;
    }

    const reservation = await prisma.reservation.create({
      data: reservationData,
      include: {
        table: {
          select: {
            number: true,
          },
        },
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating reservation:', error);
    // Return more detailed error message
    return NextResponse.json(
      { 
        error: 'Failed to create reservation',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

