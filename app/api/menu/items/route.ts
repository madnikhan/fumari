import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getSessionFromRequest } from '@/lib/auth';

// Get all menu items (for management - includes unavailable items)
export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type');

    let where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (type) {
      where.category = { type };
    }

    const items = await prisma.menuItem.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameTr: true,
            type: true,
          },
        },
      },
      orderBy: [
        { category: { displayOrder: 'asc' } },
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items', details: error.message },
      { status: 500 }
    );
  }
}

// Create new menu item
export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      nameTr,
      description,
      descriptionTr,
      categoryId,
      price,
      preparationTime,
      available,
      displayOrder,
    } = body;

    // Validation
    if (!name || !categoryId || price === undefined) {
      return NextResponse.json(
        { error: 'Name, category, and price are required' },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { error: 'Price must be non-negative' },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.menuCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        nameTr: nameTr || null,
        description: description || null,
        descriptionTr: descriptionTr || null,
        categoryId,
        price: parseFloat(price),
        preparationTime: preparationTime ? parseInt(preparationTime) : null,
        available: available !== undefined ? available : true,
        displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameTr: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item', details: error.message },
      { status: 500 }
    );
  }
}

