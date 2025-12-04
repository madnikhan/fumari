import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/accounting/login',
    '/kitchen/login',
    '/dashboard/kiosk',
    '/dashboard/kitchen', // Kitchen panel is public (no login required)
  ];

  // Public route patterns (for dynamic routes)
  if (pathname.startsWith('/table/')) {
    return NextResponse.next();
  }

  // Public API routes (for kiosk and public access)
  const publicApiRoutes = [
    '/api/auth/',
    '/api/accounting/auth/', // Accounting login/logout/session
    '/api/kitchen/auth/', // Kitchen login/logout/session
    '/api/menu',
    '/api/tables', // Kiosk needs to see tables for selection
    '/api/orders', // Kiosk needs to create orders
    '/api/staff', // Kiosk needs staff for order assignment
    '/api/buzzer/table/', // Public access to table info via QR code
    '/api/buzzer/request', // Public access to create buzzer requests
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
    
    // Kitchen API routes are public (no authentication required)
    if (pathname.startsWith('/api/kitchen/')) {
      return NextResponse.next();
    }
    
    // Accounting API routes require accounting session
    if (pathname.startsWith('/api/accounting/')) {
      const accountingSession = request.cookies.get('accounting_session');
      
      if (!accountingSession || accountingSession.value !== 'authenticated') {
        return NextResponse.json(
          { error: 'Unauthorized - Accounting access required' },
          { status: 401 }
        );
      }
      
      return NextResponse.next();
    }
    
    // Protected API route - require regular authentication
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

  // Protect dashboard routes (except kiosk and kitchen which are already in publicRoutes)
  if (pathname.startsWith('/dashboard')) {
    // Kitchen routes are public (no authentication required)
    if (pathname.startsWith('/dashboard/kitchen')) {
      return NextResponse.next();
    }
    
    // Accounting routes require accounting session
    if (pathname.startsWith('/dashboard/accounting')) {
      const accountingSession = request.cookies.get('accounting_session');
      
      if (!accountingSession || accountingSession.value !== 'authenticated') {
        const loginUrl = new URL('/accounting/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      return NextResponse.next();
    }
    
    // Other dashboard routes require regular session
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

