import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth'; // Ensure verifyToken works in Edge runtime (it does with jose)
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'a-very-secure-fallback-secret-key-for-local-dev-12345'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const path = request.nextUrl.pathname;

  // Paths that don't require auth
  if (path === '/login' || path.startsWith('/_next') || path.startsWith('/api/auth')) {
    // If logged in and trying to access /login, redirect to /
    if (path === '/login' && token) {
      try {
        await jwtVerify(token, SECRET_KEY);
        return NextResponse.redirect(new URL('/', request.url));
      } catch (e) {
        // invalid token, let them log in
      }
    }
    return NextResponse.next();
  }

  // Require auth for all other routes (/, /admin, etc)
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let payload;
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    payload = verified.payload as { role: string };
  } catch (err) {
    // Token is invalid/expired
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }

  // Admin route protection
  if (path.startsWith('/admin') && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
