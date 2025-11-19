import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function GET() {
  try {
    const categories = await prisma.menuCategory.findMany({
      where: {
        active: true,
      },
      include: {
        items: {
          where: {
            available: true,
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    // Always return an array, even if empty
    return NextResponse.json(Array.isArray(categories) ? categories : []);
  } catch (error) {
    console.error('Error fetching menu:', error);
    // Return empty array with 200 status to prevent client-side errors
    return NextResponse.json([], { status: 200 });
  }
}

