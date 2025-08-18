import { NextRequest, NextResponse } from 'next/server';

// Define route patterns
const MARKETING_ROUTES = [
  '/',
  '/about',
  '/pricing', 
  '/contact',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/privacy-policy',
  '/terms',
  '/cookies',
  '/faq',
  '/testimonials'
];

const APP_ROUTES = [
  '/dashboard',
  '/meetings',
  '/learning',
  '/project-collaboration',
  '/forum',
  '/announcements',
  '/profile',
  '/settings',
  '/club',
  '/onboarding'
];

function isMarketingPage(pathname: string): boolean {
  return MARKETING_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAppPage(pathname: string): boolean {
  return APP_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAuthenticated(request: NextRequest): boolean {
  // Check for auth token in cookies
  // The auth system uses httpOnly cookies, so we need to check for the presence of auth cookies
  const authCookie = request.cookies.get('auth_token') || 
                    request.cookies.get('session') ||
                    request.cookies.get('access_token');
  
  return !!authCookie;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const isAuth = isAuthenticated(request);
  
  // Redirect authenticated users away from marketing pages to dashboard
  if (isAuth && isMarketingPage(pathname)) {
    // Exception: allow access to auth logout flows
    if (pathname.startsWith('/auth/')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect unauthenticated users from app pages to login
  if (!isAuth && isAppPage(pathname)) {
    // Store the intended destination for after login
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};