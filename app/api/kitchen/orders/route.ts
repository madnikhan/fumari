import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let where: any = {
      status: {
        in: ['pending', 'preparing', 'ready'],
      },
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    const orderItems = await prisma.orderItem.findMany({
      where,
      include: {
        order: {
          include: {
            table: {
              select: {
                number: true,
              },
            },
          },
        },
        menuItem: {
          include: {
            category: {
              select: {
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Always return an array, even if empty
    return NextResponse.json(Array.isArray(orderItems) ? orderItems : []);
  } catch (error) {
    console.error('Error fetching kitchen orders:', error);
    // Return empty array with 200 status to prevent client-side errors
    return NextResponse.json([], { status: 200 });
  }
}

