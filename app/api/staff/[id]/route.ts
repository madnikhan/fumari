import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

// Get single staff member
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        assignedTables: {
          select: {
            id: true,
            number: true,
            status: true,
          },
        },
        orders: {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
          },
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(staff);
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff', details: error.message },
      { status: 500 }
    );
  }
}

// Update staff member
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, role, pin, active } = body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (role !== undefined) updateData.role = role;
    if (pin !== undefined) updateData.pin = pin;
    if (active !== undefined) updateData.active = active;

    const staff = await prisma.staff.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(staff);
  } catch (error: any) {
    console.error('Error updating staff:', error);
    return NextResponse.json(
      { error: 'Failed to update staff', details: error.message },
      { status: 500 }
    );
  }
}

// Delete staff member
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if staff has active orders or assigned tables
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        orders: {
          where: {
            status: {
              not: 'completed',
            },
          },
        },
        assignedTables: {
          where: {
            status: {
              not: 'available',
            },
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    if (staff.orders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete staff member with active orders' },
        { status: 400 }
      );
    }

    // Instead of deleting, mark as inactive
    await prisma.staff.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ message: 'Staff member deactivated successfully' });
  } catch (error: any) {
    console.error('Error deleting staff:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff', details: error.message },
      { status: 500 }
    );
  }
}

