import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      include: {
        section: true,
        assignedWaiter: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        number: 'asc',
      },
    });

    // Always return an array, even if empty
    return NextResponse.json(Array.isArray(tables) ? tables : []);
  } catch (error) {
    console.error('Error fetching tables:', error);
    // Return empty array with 200 status to prevent client-side errors
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { number, capacity, sectionId, status } = body;

    const table = await prisma.table.create({
      data: {
        number,
        capacity,
        sectionId,
        status: status || 'available',
        currentGuests: 0,
      },
      include: {
        section: true,
      },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}

