import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const FIXED_USERS = [
  { id: 1, email: 'admin@example.com', password: 'admin', role: 'admin', createdAt: new Date().toISOString() },
  { id: 2, email: 'airtel@example.com', password: 'airtel', role: 'viewer', createdAt: new Date().toISOString() },
  { id: 3, email: 'jio@example.com', password: 'jio', role: 'viewer', createdAt: new Date().toISOString() }
];

// Middleware logic is handled in middleware.ts, but we also verify session here for safety
async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized');
  }
}

export async function GET() {
  try {
    await requireAdmin();
    // Return fixed users including passwords as requested
    return NextResponse.json({ users: FIXED_USERS });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'User creation is disabled. Using fixed credentials.' }, { status: 403 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: 'User deletion is disabled. Using fixed credentials.' }, { status: 403 });
}
