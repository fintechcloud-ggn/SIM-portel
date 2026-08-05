import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Hardcoded users for authentication instead of a database
const USERS = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'admin', // simple password for testing
    role: 'admin',
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'user', // simple password for testing
    role: 'user',
  },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user in the hardcoded array
    const user = USERS.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Verify password directly
    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session token
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
