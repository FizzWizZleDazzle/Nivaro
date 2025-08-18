'use client';

import { useAuth } from '../contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from './Loading';

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
        pathname === route || (route !== '/' && pathname.startsWith(route))
    );
}

function isAppPage(pathname: string): boolean {
    return APP_ROUTES.some(route =>
        pathname === route || pathname.startsWith(route)
    );
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return; // Wait for authentication to complete
    }

    const isAuthenticated = !!user;

    // Redirect authenticated users away from marketing pages to dashboard
    if (isAuthenticated && isMarketingPage(pathname)) {
        if (!pathname.startsWith('/auth/')) { // allow access to auth pages like logout
            router.push('/dashboard');
        }
    }

    // Redirect unauthenticated users from app pages to login
    if (!isAuthenticated && isAppPage(pathname)) {
      router.push(`/auth/login?redirect=${pathname}`);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}
