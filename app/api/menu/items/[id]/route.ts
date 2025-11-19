import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { getSessionFromRequest } from '@/lib/auth';

// Get single menu item
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
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu item', details: error.message },
      { status: 500 }
    );
  }
}

// Update menu item
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

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (nameTr !== undefined) updateData.nameTr = nameTr || null;
    if (description !== undefined) updateData.description = description || null;
    if (descriptionTr !== undefined) updateData.descriptionTr = descriptionTr || null;
    if (categoryId !== undefined) {
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
      updateData.categoryId = categoryId;
    }
    if (price !== undefined) {
      if (price < 0) {
        return NextResponse.json(
          { error: 'Price must be non-negative' },
          { status: 400 }
        );
      }
      updateData.price = parseFloat(price);
    }
    if (preparationTime !== undefined) {
      updateData.preparationTime = preparationTime ? parseInt(preparationTime) : null;
    }
    if (available !== undefined) updateData.available = available;
    if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder);

    const item = await prisma.menuItem.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update menu item', details: error.message },
      { status: 500 }
    );
  }
}

// Delete menu item
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

    // Check if item is used in any orders
    const orderItems = await prisma.orderItem.findFirst({
      where: { menuItemId: id },
    });

    if (orderItems) {
      // Soft delete by setting available to false
      const item = await prisma.menuItem.update({
        where: { id },
        data: { available: false },
      });
      return NextResponse.json({ ...item, deleted: false, message: 'Item marked as unavailable (used in orders)' });
    }

    // Hard delete if not used
    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete menu item', details: error.message },
      { status: 500 }
    );
  }
}

