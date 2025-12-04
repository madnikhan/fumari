import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma-client';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Note: createSession is now handled directly in API routes using NextResponse.cookies.set()
// This function is kept for backward compatibility but should not be used in API routes
export async function createSession(userId: string, username: string, role: string) {
  try {
    const cookieStore = await cookies();
    const sessionData = {
      userId,
      username,
      role,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    
    cookieStore.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// Get session from cookies (for Server Components)
export async function getSession(): Promise<{ userId: string; username: string; role: string } | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return null;
    }
    
    const sessionData = JSON.parse(sessionCookie.value);
    
    // Check if session expired
    if (sessionData.expiresAt < Date.now()) {
      await destroySession();
      return null;
    }
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId },
      select: { id: true, username: true, role: true, active: true },
    });
    
    if (!user || !user.active) {
      await destroySession();
      return null;
    }
    
    return {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Get session from request headers (for API routes)
export async function getSessionFromRequest(request: Request): Promise<{ userId: string; username: string; role: string } | null> {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return null;
    }

    // Parse cookies from header
    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });

    const sessionCookie = cookies['session'];
    if (!sessionCookie) {
      return null;
    }
    
    const sessionData = JSON.parse(sessionCookie);
    
    // Check if session expired
    if (sessionData.expiresAt < Date.now()) {
      return null;
    }
    
    // Check if this is a waiter session (Staff ID) or regular user session
    // Try to find User first
    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId },
      select: { id: true, username: true, role: true, active: true },
    });
    
    if (user && user.active) {
      // Regular user session
      return {
        userId: user.id,
        username: user.username,
        role: user.role,
      };
    }
    
    // Check if it's a waiter session (Staff ID)
    const staff = await prisma.staff.findUnique({
      where: { id: sessionData.userId },
      select: { id: true, name: true, role: true, active: true },
    });
    
    if (staff && staff.active) {
      // Waiter session
      return {
        userId: staff.id,
        username: staff.name,
        role: staff.role,
      };
    }
    
    // Neither user nor staff found, or inactive
    return null;
  } catch (error) {
    console.error('Error getting session from request:', error);
    return null;
  }
}

export async function destroySession() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session');
  } catch (error) {
    console.error('Error destroying session:', error);
  }
}

