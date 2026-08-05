'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserPlus, Trash2, Loader2, Users } from 'lucide-react';

type User = {
  id: number;
  email: string;
  role: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('viewer');
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 401) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole }),
      });
      if (res.ok) {
        setNewEmail('');
        setNewPassword('');
        setNewRole('viewer');
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0f1c] py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl ring-1 ring-indigo-500/20 backdrop-blur-md">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
              <p className="text-slate-400 font-medium">Manage access to the SIM platform</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl ring-1 ring-white/10 transition-colors font-medium"
          >
            Back to Portal
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create User Form */}
          <div className="lg:col-span-1">
            <div className="bg-[#111827]/80 backdrop-blur-xl rounded-3xl p-8 ring-1 ring-white/10 shadow-xl sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">Add New User</h2>
              </div>
              <form onSubmit={handleAddUser} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-300 ml-1 mb-2 block">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-[#0a0f1c]/50 border-0 px-4 py-3 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 ml-1 mb-2 block">Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0a0f1c]/50 border-0 px-4 py-3 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 ml-1 mb-2 block">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-[#0a0f1c]/50 border-0 px-4 py-3 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
                  >
                    <option value="viewer">Viewer (Search Only)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 mt-2"
                >
                  Create User
                </button>
              </form>
            </div>
          </div>

          {/* User List */}
          <div className="lg:col-span-2">
            <div className="bg-[#111827]/80 backdrop-blur-xl rounded-3xl p-8 ring-1 ring-white/10 shadow-xl min-h-[500px]">
              <div className="flex items-center gap-3 mb-8">
                <Users className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">Active Users</h2>
              </div>
              
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl ring-1 ring-white/5 hover:ring-white/10 transition-all">
                    <div>
                      <p className="font-bold text-white text-lg flex items-center gap-2">
                        {user.email}
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md font-bold ${
                          user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30' : 'bg-slate-500/20 text-slate-400 ring-1 ring-slate-500/30'
                        }`}>
                          {user.role}
                        </span>
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                        {user.password && (
                          <> &bull; Password: <span className="font-mono bg-slate-800 px-1 rounded text-slate-300">{user.password}</span></>
                        )}
                      </p>
                    </div>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={actionLoading}
                        className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-center text-slate-500 py-12">No users found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
