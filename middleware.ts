import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/dashboard/kiosk',
  ];

  // Public API routes (for kiosk and public access)
  const publicApiRoutes = [
    '/api/auth/',
    '/api/menu',
    '/api/tables', // Kiosk needs to see tables for selection
    '/api/orders', // Kiosk needs to create orders
    '/api/staff', // Kiosk needs staff for order assignment
  ];

  // Check if route is public page
  if (publicRoutes.includes(pathname) || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Check if API route is public
  if (pathname.startsWith('/api/')) {
    const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));
    if (isPublicApi) {
      return NextResponse.next();
    }
    // Protected API route - require authentication
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value);
      
      if (sessionData.expiresAt < Date.now()) {
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    return NextResponse.next();
  }

  // Protect dashboard routes (except kiosk which is already in publicRoutes)
  if (pathname.startsWith('/dashboard')) {
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value);
      
      // Check if session expired
      if (sessionData.expiresAt < Date.now()) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        loginUrl.searchParams.set('expired', 'true');
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // Invalid session cookie
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

