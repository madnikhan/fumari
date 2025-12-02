import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const KITCHEN_USERNAME = 'kitchen';
// Pre-hashed password for 'kitchen123'
const KITCHEN_PASSWORD_HASH = '$2b$10$1i.iYxL4W4FP1KtT12q4leAzBWd/XVH/gDZI7xgR7lPUCNr43wv4G';

/**
 * Verify kitchen credentials
 */
export async function verifyKitchenCredentials(username: string, password: string): Promise<boolean> {
  if (username !== KITCHEN_USERNAME) {
    return false;
  }
  
  // Compare password with hash
  return await bcrypt.compare(password, KITCHEN_PASSWORD_HASH);
}

/**
 * Create kitchen session
 */
export function createKitchenSession(response: NextResponse) {
  response.cookies.set('kitchen_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return response;
}

/**
 * Get kitchen session from cookies (for Server Components)
 */
export async function getKitchenSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('kitchen_session');
    return session?.value === 'authenticated';
  } catch (error) {
    return false;
  }
}

/**
 * Check kitchen session from request (for API routes)
 */
export function getKitchenSessionFromRequest(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return false;
  
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies['kitchen_session'] === 'authenticated';
}

/**
 * Destroy kitchen session
 */
export function destroyKitchenSession(response: NextResponse) {
  response.cookies.delete('kitchen_session');
  return response;
}

