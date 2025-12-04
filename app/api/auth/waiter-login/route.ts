import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

// Waiter login using Staff PIN
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, pin } = body;

    if (!name || !pin) {
      return NextResponse.json(
        { error: 'Name and PIN are required' },
        { status: 400 }
      );
    }

    // Find staff member by name and PIN
    const staff = await prisma.staff.findFirst({
      where: {
        name: { contains: name, mode: 'insensitive' },
        pin: pin,
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Invalid name or PIN' },
        { status: 401 }
      );
    }

    // Create session data with Staff ID
    const sessionData = {
      userId: staff.id, // Using Staff ID as userId for waiter sessions
      username: staff.name,
      role: staff.role,
      staffId: staff.id, // Keep Staff ID separate
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    });

    // Set session cookie
    try {
      response.cookies.set('session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      });
    } catch (cookieError: any) {
      console.error('Error setting cookie:', cookieError);
    }

    return response;
  } catch (error: any) {
    console.error('Error during waiter login:', error);
    return NextResponse.json(
      { error: 'Failed to login', details: error.message },
      { status: 500 }
    );
  }
}

