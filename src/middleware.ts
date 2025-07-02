import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply to studio routes
  if (request.nextUrl.pathname.startsWith('/studio')) {
    // Check if user is authenticated (you can customize this logic)
    const isAuthenticated = checkAuthentication(request);

    if (!isAuthenticated) {
      // Redirect to login page or show access denied
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

function checkAuthentication(request: NextRequest): boolean {
  // Add your authentication logic here
  // For example, check for a valid session token or API key

  // For now, we'll allow all access (you can customize this)
  return true;
}

export const config = {
  matcher: '/studio/:path*',
};
