import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/premium'];
  const authRoutes = ['/login', '/signup'];
  const publicRoutes = ['/api', '/not-found', '/pricing'];

  const path = req.nextUrl.pathname;

  // Skip middleware for public routes, static files, and shortCode routes
  if (publicRoutes.some(route => path.startsWith(route)) || 
      path === '/' ||
      path.match(/^\/.+$/) || // Matches /{shortCode} routes
      path.startsWith('/_next') ||
      path.startsWith('/static') ||
      path.includes('.')) {
    return res;
  }

  // If trying to access a protected route without being logged in
  if (protectedRoutes.some(route => path.startsWith(route)) && !session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('from', path);
    return NextResponse.redirect(redirectUrl);
  }

  // If trying to access auth pages while logged in
  if (authRoutes.some(route => path.startsWith(route)) && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};