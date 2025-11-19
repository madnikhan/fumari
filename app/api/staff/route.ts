import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: [
        { role: 'asc' },
        { name: 'asc' },
      ],
    });

    // Always return an array, even if empty
    return NextResponse.json(Array.isArray(staff) ? staff : []);
  } catch (error) {
    console.error('Error fetching staff:', error);
    // Return empty array with 200 status to prevent client-side errors
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, role, pin } = body;

    // Validation
    if (!name || !role) {
      return NextResponse.json(
        { error: 'Name and role are required' },
        { status: 400 }
      );
    }

    // Validate PIN format (4 digits)
    if (pin && (!/^\d{4}$/.test(pin))) {
      return NextResponse.json(
        { error: 'PIN must be 4 digits' },
        { status: 400 }
      );
    }

    // Generate PIN if not provided
    const finalPin = pin || Math.floor(1000 + Math.random() * 9000).toString();

    const staff = await prisma.staff.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        role,
        pin: finalPin,
        active: true,
      },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error: any) {
    console.error('Error creating staff:', error);
    
    // Handle unique constraint violation (email)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create staff', details: error.message },
      { status: 500 }
    );
  }
}

