'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, User, Phone, Mail, Building, MapPin, CreditCard, Image as ImageIcon, ExternalLink, CalendarDays, LogOut, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [aadhar, setAadhar] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadhar.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await fetch(`/api/search?aadhar=${encodeURIComponent(aadhar)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to search');
      }

      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert Google Drive viewer link to direct embed link
  const getEmbedUrl = (driveLink: string) => {
    if (!driveLink) return '';
    try {
      const url = new URL(driveLink);
      const id = url.searchParams.get('id');
      if (id) {
        return `https://drive.google.com/file/d/${id}/preview`;
      }
      return driveLink;
    } catch {
      return driveLink;
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0f1c] flex flex-col items-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-0 -translate-y-12 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-500/20 via-purple-500/5 to-transparent blur-3xl pointer-events-none"></div>

      {/* Navbar */}
      <div className="w-full max-w-7xl flex justify-end items-center gap-4 relative z-10 mb-8">
        {user && (
          <div className="flex items-center gap-4 bg-[#111827]/80 backdrop-blur-xl px-6 py-3 rounded-2xl ring-1 ring-white/10 shadow-lg">
            <span className="text-slate-300 font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              {user.email}
            </span>
            <div className="w-px h-4 bg-white/10"></div>
            {user.role === 'admin' && (
              <>
                <button
                  onClick={() => router.push('/admin')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Panel
                </button>
                <div className="w-px h-4 bg-white/10"></div>
              </>
            )}
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 font-medium text-sm flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-5xl space-y-16 relative z-10">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-500/10 rounded-2xl ring-1 ring-indigo-500/20 mb-4 backdrop-blur-md">
            <Search className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 tracking-tight">
            SIM Registration Portal
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            Quickly verify and access registration details securely.
          </p>
        </div>

        {/* Search Bar Section */}
        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <form onSubmit={handleSearch} className="relative bg-[#111827]/80 backdrop-blur-xl rounded-2xl shadow-2xl flex items-center p-2 overflow-hidden ring-1 ring-white/10">
            <div className="pl-5 text-slate-500">
              <CreditCard className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={aadhar}
              onChange={(e) => setAadhar(e.target.value)}
              placeholder="Enter 12-digit Aadhar Number"
              className="w-full bg-transparent border-0 px-5 py-4 text-white placeholder:text-slate-500 focus:ring-0 text-xl font-medium outline-none tracking-wide"
            />
            <button
              type="submit"
              disabled={loading || !aadhar.trim()}
              className="bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <div className="w-full">
          {error && (
            <div className="p-6 bg-red-500/10 backdrop-blur-md text-red-400 rounded-2xl text-center ring-1 ring-red-500/20 max-w-2xl mx-auto">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {results !== null && results.length === 0 && (
            <div className="p-16 bg-[#111827]/50 backdrop-blur-xl rounded-3xl text-center ring-1 ring-white/5 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-slate-800/80 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10 shadow-inner">
                <Search className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No Records Found</h3>
              <p className="text-slate-400 text-lg">We couldn't find any registration associated with this Aadhar number.</p>
            </div>
          )}

          {results && results.length > 0 && (
            <div className="grid gap-8">
              {results.map((result, index) => (
                <div key={index} className="bg-[#111827]/80 backdrop-blur-2xl rounded-[2rem] overflow-hidden ring-1 ring-white/10 shadow-2xl relative">
                  
                  {/* Subtle Glow inside the card */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl pointer-events-none"></div>

                  {/* Card Header */}
                  <div className="px-8 md:px-12 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-6 text-white">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">{result['Employee Name'] || 'Unknown'}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-slate-400 font-medium">
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg ring-1 ring-white/10">
                            <Building className="w-4 h-4 text-indigo-400" />
                            {result['Select Domain'] || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg ring-1 ring-white/10">
                            ID: {result['Employee ID'] || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-xl ring-1 ring-indigo-500/20 font-medium">
                      <CalendarDays className="w-4 h-4" />
                      Applied: {result['Timestamp'] ? new Date(result['Timestamp']).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-8 md:px-12 md:py-10 grid lg:grid-cols-2 gap-12 relative z-10">
                    
                    {/* Left Column: Info */}
                    <div className="space-y-10">
                      <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          Contact Information
                        </h3>
                        <div className="space-y-6 bg-white/5 p-6 rounded-2xl ring-1 ring-white/5">
                          <div className="flex items-center gap-4 text-slate-300 group">
                            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                              <Phone className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="font-semibold text-lg">{result['Alternate Number'] || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-4 text-slate-300 group">
                            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                              <Mail className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="font-semibold text-lg break-all">{result['Email Address'] || 'N/A'}</span>
                          </div>
                          <div className="flex items-start gap-4 text-slate-300 group">
                            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-indigo-500/20 transition-colors shrink-0">
                              <MapPin className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="font-semibold text-lg leading-relaxed">{result['Office Location'] || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          Identity Details
                        </h3>
                        <div className="flex items-center gap-4 text-slate-300 bg-white/5 p-6 rounded-2xl ring-1 ring-white/5">
                          <div className="p-3 bg-white/5 rounded-xl">
                            <CreditCard className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Aadhar Number</p>
                            <span className="font-mono text-2xl tracking-widest font-bold text-white">{result['Aadhar Card Number'] || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Aadhar Images */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Aadhar Documents
                      </h3>
                      
                      <div className="space-y-6">
                        {/* Front Side */}
                        {result['Upload Aadhaar Card (Front Side)'] && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                              <p className="text-sm font-medium text-slate-400">Front Side</p>
                              <a href={result['Upload Aadhaar Card (Front Side)']} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                                Open Original <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="relative aspect-[1.58] rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10 hover:ring-indigo-500/50 transition-all duration-300">
                              <iframe 
                                src={getEmbedUrl(result['Upload Aadhaar Card (Front Side)'])} 
                                className="w-full h-full border-0 absolute inset-0"
                                allow="autoplay"
                              />
                            </div>
                          </div>
                        )}

                        {/* Back Side */}
                        {result['Upload Aadhaar Card (Back Side)'] && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center px-1">
                              <p className="text-sm font-medium text-slate-400">Back Side</p>
                              <a href={result['Upload Aadhaar Card (Back Side)']} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                                Open Original <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="relative aspect-[1.58] rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10 hover:ring-indigo-500/50 transition-all duration-300">
                              <iframe 
                                src={getEmbedUrl(result['Upload Aadhaar Card (Back Side)'])} 
                                className="w-full h-full border-0 absolute inset-0"
                                allow="autoplay"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
