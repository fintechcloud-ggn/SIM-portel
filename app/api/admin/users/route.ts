import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUsers, saveUsers } from '@/lib/users';

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
    // Return all users from JSON except their passwords
    const users = getUsers().map((u: any) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    
    if (role !== 'admin' && role !== 'viewer') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const users = getUsers();

    // Check if user exists
    const existing = users.find((u: any) => u.email === email);
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Assign new ID (max id + 1)
    const newId = users.length > 0 ? Math.max(...users.map((u: any) => u.id)) + 1 : 1;

    users.push({
      id: newId,
      email,
      password, // Storing plaintext as requested for simple file usage
      role,
      createdAt: new Date().toISOString()
    });

    saveUsers(users);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create User Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = request.nextUrl.searchParams;
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const id = parseInt(idParam, 10);
    const users = getUsers();

    // Check if the user exists
    const userIndex = users.findIndex((u: any) => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = users[userIndex];

    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Admin users cannot be deleted.' }, { status: 403 });
    }

    // Remove user and save
    users.splice(userIndex, 1);
    saveUsers(users);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
