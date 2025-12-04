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
    // Note: SQLite doesn't support 'mode: insensitive', so we'll search case-insensitively
    // by converting both to lowercase for comparison
    const allStaff = await prisma.staff.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pin: true,
      },
    });

    // Find matching staff (case-insensitive name match + exact PIN match)
    const staff = allStaff.find(s => 
      s.name.toLowerCase().includes(name.toLowerCase()) && 
      s.pin === pin
    );

    // Remove PIN from result before returning
    const staffResult = staff ? {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
    } : null;

    if (!staffResult) {
      return NextResponse.json(
        { error: 'Invalid name or PIN' },
        { status: 401 }
      );
    }

    // Create session data with Staff ID
    const sessionData = {
      userId: staffResult.id, // Using Staff ID as userId for waiter sessions
      username: staffResult.name,
      role: staffResult.role,
      staffId: staffResult.id, // Keep Staff ID separate
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      staff: {
        id: staffResult.id,
        name: staffResult.name,
        email: staffResult.email,
        role: staffResult.role,
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

