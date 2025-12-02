import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const ACCOUNTING_USERNAME = 'accounting';
// Pre-hashed password for 'fumari123'
const ACCOUNTING_PASSWORD_HASH = '$2b$10$mGOcfwqCsU6eAlrzDmqWaeYLxBliW2qhqneqKcmfAJOABlsSsJaj2';

/**
 * Verify accounting credentials
 */
export async function verifyAccountingCredentials(username: string, password: string): Promise<boolean> {
  if (username !== ACCOUNTING_USERNAME) {
    return false;
  }
  
  // Compare password with hash
  return await bcrypt.compare(password, ACCOUNTING_PASSWORD_HASH);
}

/**
 * Create accounting session
 */
export function createAccountingSession(response: NextResponse) {
  response.cookies.set('accounting_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return response;
}

/**
 * Get accounting session from cookies (for Server Components)
 */
export async function getAccountingSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('accounting_session');
    return session?.value === 'authenticated';
  } catch (error) {
    return false;
  }
}

/**
 * Check accounting session from request (for API routes)
 */
export function getAccountingSessionFromRequest(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return false;
  
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies['accounting_session'] === 'authenticated';
}

/**
 * Destroy accounting session
 */
export function destroyAccountingSession(response: NextResponse) {
  response.cookies.delete('accounting_session');
  return response;
}
