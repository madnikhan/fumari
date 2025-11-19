import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getSessionFromRequest } from '@/lib/auth';

// Get all menu categories (for management)
export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.menuCategory.findMany({
      include: {
        items: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Error fetching menu categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu categories', details: error.message },
      { status: 500 }
    );
  }
}

// Create new menu category
export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, nameTr, description, type, displayOrder, active } = body;

    // Validation
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const validTypes = ['food', 'drink', 'cocktail', 'shisha'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const category = await prisma.menuCategory.create({
      data: {
        name,
        nameTr: nameTr || null,
        description: description || null,
        type,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating menu category:', error);
    return NextResponse.json(
      { error: 'Failed to create menu category', details: error.message },
      { status: 500 }
    );
  }
}

