import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  console.log(`[Middleware] Path: ${request.nextUrl.pathname}`);
  console.log(`[Middleware] Authorization header present: ${!!authHeader}`);

  // Exclude public routes
  const publicRoutes = ['/', '/api/auth/login', '/api/auth/signup'];
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Only check if token EXISTS for API routes (don't verify yet - that happens in the API route)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!token) {
      console.log(`[Middleware] No token for ${request.nextUrl.pathname}`);
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log(`[Middleware] Token present, proceeding to API route`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
