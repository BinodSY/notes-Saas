import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // For normal requests, add CORS headers
  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', '*');
  return res;
}

// Apply middleware only to API routes
export const config = {
  matcher: '/api/:path*',
};
