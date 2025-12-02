import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tableId = searchParams.get('tableId');

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (tableId) {
      where.tableId = tableId;
    }

    // Get buzzer requests
    const requests = await prisma.buzzerRequest.findMany({
      where,
      include: {
        table: {
          select: {
            number: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(requests, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching buzzer requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buzzer requests', details: error.message },
      { status: 500 }
    );
  }
}

