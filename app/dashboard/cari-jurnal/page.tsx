'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

export default function CariJurnalPage() {
  const router = useRouter();
  const HARGA_KOIN = 5;

  const [userId, setUserId] = useState<string | null>(null);
  const [koin, setKoin] = useState(0);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/auth');
      setUserId(session.user.id);

      const { data } = await supabase.from('users_data').select('koin').eq('id', session.user.id).single();
      if (data) setKoin(data.koin);
    };
    fetchUser();
  }, [router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (koin < HARGA_KOIN) {
      alert(`Koin tidak cukup! Kamu butuh ${HARGA_KOIN} Koin untuk mencari jurnal.`);
      return router.push('/dashboard/upgrade');
    }

    setIsSearching(true);

    try {
      // 1. Potong koin
      const { error } = await supabase.from('users_data').update({ koin: koin - HARGA_KOIN }).eq('id', userId);
      if (error) throw error;
      setKoin(prev => prev - HARGA_KOIN);

      // 2. TODO: Ganti dengan Fetch API ke endpoint Google Scholar AI milikmu
   // Ganti blok Promise setTimeout dengan ini:
const res = await fetch('/api/cari-jurnal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: query })
  });
  
  if (!res.ok) throw new Error("Gagal mencari jurnal");
  const data = await res.json();
  setResults(data.results);
    
    } catch (err) {
      alert("Gagal memproses AI. Koin tidak terpotong (Rollback otomatis).");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* Navbar Atas */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold text-sm transition-colors">
            <span>&larr;</span> Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
            <span className="text-amber-500">🪙</span>
            <span className="text-sm font-bold text-slate-800">{koin} Koin</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl text-3xl mb-4">🔍</div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Cari Jurnal Scholar</h1>
          <p className="text-slate-500 mt-2">Bantu temukan referensi jurnal terakreditasi internasional dan nasional dengan cepat.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Contoh: Pengaruh AI terhadap kualitas pendidikan..."
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl focus:ring-blue-500 focus:border-blue-500 block w-full p-4 outline-none transition-all"
              required
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className="bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shrink-0"
            >
              {isSearching ? 'Mencari...' : `Cari (-${HARGA_KOIN} Koin)`}
            </button>
          </form>

          {/* Area Hasil */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-60">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium animate-pulse text-blue-600">AI sedang menelusuri Google Scholar...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="font-bold text-slate-700 text-sm mb-4">Hasil Pencarian:</h3>
                {results.map((res, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-blue-700 hover:underline cursor-pointer leading-tight">{res.judul}</h4>
                        <p className="text-xs text-green-700 font-semibold mt-1">{res.penulis} - {res.tahun}</p>
                        <p className="text-xs text-slate-500 mt-1">{res.sumber}</p>
                      </div>
                      <a href={res.link} className="bg-white border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 shrink-0">Sitasi</a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <p className="text-sm">Hasil pencarian AI akan muncul di sini.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}