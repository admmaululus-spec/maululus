'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      // 1. Cek sesi login
      const { data: { session } } = await supabase.auth.getSession();
      
      // Jika belum login sama sekali, lempar ke halaman Auth
      if (!session) {
        router.push('/auth');
        return;
      }
      
      // 2. Ambil role dari tabel profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      // 3. Validasi Role: Jika bukan admin, tendang ke dashboard user!
      if (profile?.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      // Lolos validasi
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAdmin();
  }, [router]);

  // Layar loading saat mengecek hak akses
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="text-sm font-semibold text-slate-500">Memverifikasi akses admin...</p>
        </div>
      </div>
    );
  }

  // Jika tidak punya akses (mencegah kedipan UI sebelum redirect)
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* SIDEBAR KIRI - Desain Premium */}
      <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col fixed h-full z-50 border-r border-slate-800/50 shadow-2xl">
        
        {/* Header Logo */}
        <div className="p-8 pb-6">
          <div className="text-2xl font-black text-white tracking-tight">Mau<span className="text-blue-500">lulus</span></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Admin Panel</p>
        </div>
        
        {/* Menu Navigasi */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          
          <Link href="/admin" className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname === '/admin' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Overview Stats
          </Link>

          {/* MENU BARU: Kelola Analis */}
          <Link href="/admin/analis" className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname?.includes('/admin/analis') ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Kelola Analis
          </Link>

          <Link href="/admin/users" className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname?.includes('/admin/users') ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Kelola User & Koin
          </Link>

          {/* MENU BARU: Transaksi & Keuangan */}
          <Link href="/admin/transaksi" className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname?.includes('/admin/transaksi') ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Validasi Pembayaran
          </Link>

          <Link href="/admin/skripsi" className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname?.includes('/admin/skripsi') ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Database Skripsi
          </Link>

          <Link href="/admin/broadcast" className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname?.includes('/admin/broadcast') ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Export WA & Mail
          </Link>
          
        </nav>

        {/* Footer Sidebar */}
        <div className="p-6">
          <Link href="/dashboard" className="flex justify-center items-center gap-2 w-full bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white py-3.5 rounded-xl text-xs font-bold transition-colors border border-slate-700/50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Mode User Biasa
          </Link>
        </div>

      </aside>

      {/* KONTEN KANAN */}
      <main className="flex-1 ml-64 p-8 sm:p-12 min-h-screen">
        {children}
      </main>
    </div>
  );
}