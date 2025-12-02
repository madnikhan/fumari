import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

// Get table info by table number (public endpoint for QR code access)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ tableNumber: string }> }
) {
  try {
    const { tableNumber } = await params;
    const tableNum = parseInt(tableNumber);

    if (isNaN(tableNum)) {
      return NextResponse.json(
        { error: 'Invalid table number' },
        { status: 400 }
      );
    }

    const table = await prisma.table.findUnique({
      where: { number: tableNum },
      include: {
        section: {
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

    // Return minimal info (no sensitive data)
    return NextResponse.json({
      id: table.id,
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      section: table.section.name,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching table info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table info', details: error.message },
      { status: 500 }
    );
  }
}

