import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';
import { verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user by username or email
    let user;
    try {
      // Ensure Prisma Client is connected
      await prisma.$connect().catch(() => {
        // Connection might already be established, ignore error
      });
      
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email: username },
          ],
          active: true,
        },
      });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      // Log full error for debugging
      console.error('Database error details:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta,
        stack: dbError.stack,
        name: dbError.name,
        cause: dbError.cause,
      });
      
      // Check if it's a Prisma Client initialization error
      if (dbError.name === 'PrismaClientInitializationError') {
        return NextResponse.json(
          { 
            error: 'Database connection failed', 
            details: `Prisma Client initialization error: ${dbError.message}`,
            code: dbError.code || 'P1001',
            hint: 'Check DATABASE_URL environment variable',
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Database error', 
          details: dbError.message || 'Internal server error',
          code: dbError.code || 'UNKNOWN',
        },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password
    let isValidPassword = false;
    try {
      isValidPassword = await verifyPassword(password, user.password);
    } catch (verifyError: any) {
      console.error('Error verifying password:', verifyError);
      return NextResponse.json(
        { error: 'Failed to verify password', details: process.env.NODE_ENV === 'development' ? verifyError.message : 'Internal server error' },
        { status: 500 }
      );
    }
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Create session data
    const sessionData = {
      userId: user.id,
      username: user.username,
      role: user.role,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

    // Set session cookie - wrap in try-catch to handle any cookie setting errors
    try {
      response.cookies.set('session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      });
    } catch (cookieError: any) {
      console.error('Error setting cookie:', cookieError);
      // Still return success response even if cookie setting fails
      // The client can handle this case
    }

    return response;
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { 
        error: 'Failed to login', 
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

