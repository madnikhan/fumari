import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getSessionFromRequest } from '@/lib/auth';

// Get single category
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const category = await prisma.menuCategory.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category', details: error.message },
      { status: 500 }
    );
  }
}

// Update category
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, nameTr, description, type, displayOrder, active } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (nameTr !== undefined) updateData.nameTr = nameTr || null;
    if (description !== undefined) updateData.description = description || null;
    if (type !== undefined) {
      const validTypes = ['food', 'drink', 'cocktail', 'shisha'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: `Type must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.type = type;
    }
    if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder);
    if (active !== undefined) updateData.active = active;

    const category = await prisma.menuCategory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error updating category:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update category', details: error.message },
      { status: 500 }
    );
  }
}

// Delete category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if category has items
    const items = await prisma.menuItem.findFirst({
      where: { categoryId: id },
    });

    if (items) {
      // Soft delete by setting active to false
      const category = await prisma.menuCategory.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({ ...category, deleted: false, message: 'Category marked as inactive (has menu items)' });
    }

    // Hard delete if no items
    await prisma.menuCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete category', details: error.message },
      { status: 500 }
    );
  }
}

