import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Apply to studio routes
  if (request.nextUrl.pathname.startsWith('/studio')) {
    // Check if user is authenticated (you can customize this logic)
    const isAuthenticated = checkAuthentication(request);

    if (!isAuthenticated) {
      // Redirect to login page or show access denied
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Apply CORS headers to API routes
  if (request.nextUrl.pathname.startsWith('/api/cms')) {
    const response = NextResponse.next();

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

    return response;
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
  matcher: ['/studio/:path*', '/api/cms/:path*'],
};
