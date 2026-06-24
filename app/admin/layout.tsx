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
  
  // States Profil & E-Wallet
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [userPhoto, setUserPhoto] = useState<string>('');

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace('/auth');
        return;
      }

      setUserEmail(session.user.email || 'Pengguna');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        router.replace('/dashboard');
        return;
      }

      const currentRole = profile.role?.toLowerCase() || 'user';
      setUserRole(currentRole);

      // ========================================================
      // STRICT ROUTING & ROLE AUTHORIZATION RULE
      // ========================================================
      const isPathAdminRoot = pathname === '/admin';
      const isPathAnalystZone = pathname?.startsWith('/admin/analis') || pathname?.startsWith('/admin/chat');
      const isPathAdminZone = pathname?.startsWith('/admin');

      if (currentRole === 'admin') {
        // Admin bebas di seluruh area /admin
        setIsAuthorized(true);
      } else if (currentRole === 'analyst' || currentRole === 'analis') {
        // Analis HANYA boleh di /admin/analis atau /admin/chat
        if (isPathAdminRoot || (!isPathAnalystZone && isPathAdminZone)) {
          router.replace('/admin/chat'); // Tendang ke halaman default analis
          return;
        }
        setIsAuthorized(true);
      } else {
        // User biasa atau role lain tidak boleh masuk /admin sama sekali
        router.replace('/dashboard');
        return;
      }

      // --- AMBIL DATA KOIN ---
      const { data: userData } = await supabase
        .from('users_data')
        .select('koin')
        .eq('id', session.user.id)
        .single();
      if (userData) setWalletBalance(userData.koin);

      // --- AMBIL FOTO PROFIL KHUSUS ANALIS ---
      if (currentRole === 'analyst' || currentRole === 'analis') {
        const { data: analystData } = await supabase
          .from('analyst_profiles')
          .select('photo_url')
          .eq('user_id', session.user.id)
          .single();
        if (analystData?.photo_url) setUserPhoto(analystData.photo_url);
      }

      setIsLoading(false);
    };
    
    checkAdmin();
  }, [router, pathname]); // Pastikan pathname ada di dependency array

  const handleLogout = async () => {
    if(confirm('Yakin ingin keluar dari ruang kerja?')) {
      await supabase.auth.signOut();
      router.replace('/auth');
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
    </div>
  );
  
  if (!isAuthorized) return null;

  const isAdmin = userRole === 'admin';
  const isChatRoom = pathname?.includes('/admin/chat');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
      
      {/* SIDEBAR UTAMA */}
      <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col fixed h-full z-50 border-r border-slate-800/50 shadow-2xl">
        <div className="p-8 pb-6 shrink-0">
          <div className="text-2xl font-black text-white tracking-tight">Mau<span className="text-blue-500">lulus</span></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">
            {isAdmin ? 'Admin Panel' : 'Analyst Workspace'}
          </p>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          
          {isAdmin ? (
            <>
              {/* ================= MENU KHUSUS ADMIN ================= */}
              <Link href="/admin" className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname === '/admin' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                Overview Stats
              </Link>

              <Link href="/admin/users" className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname?.includes('/admin/users') ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                Kelola User & Koin
              </Link>

              <Link href="/admin/analis" className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname?.includes('/admin/analis') ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
                Kelola Tim Analis
              </Link>

              <Link href="/admin/skripsi" className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname?.includes('/admin/skripsi') ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                Database Skripsi
              </Link>

              <Link href="/admin/broadcast" className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname?.includes('/admin/broadcast') ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                Export WA & Mail
              </Link>

              <Link href="/admin/promos" className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname?.includes('/admin/promos') ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>
                Pop-Up Promo
              </Link>
            </>
          ) : (
            <>
              {/* ================= MENU KHUSUS ANALIS ================= */}
              <Link href="/admin/chat" className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname?.includes('/admin/chat') ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.84 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>
                Pesan Masuk (Klien)
              </Link>

              <Link href="/admin/analis" className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${pathname === '/admin/analis' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-slate-200'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                Pengaturan Profil Saya
              </Link>
            </>
          )}
        </nav>

        {/* ================= BAGIAN BAWAH: E-WALLET & AKUN ================= */}
        <div className="p-5 border-t border-slate-800/60 bg-slate-900/50 shrink-0">
          
          <div className="bg-slate-800/80 rounded-xl p-3.5 mb-4 flex items-center justify-between border border-slate-700/50 shadow-inner">
            <div className="flex items-center gap-2.5">
              <span className={`${isAdmin ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'} h-7 w-7 rounded-lg flex items-center justify-center text-sm`}>
                {isAdmin ? '💎' : '💰'}
              </span>
              <span className={`text-[11px] font-bold uppercase tracking-widest ${isAdmin ? 'text-slate-400' : 'text-emerald-400'}`}>
                {isAdmin ? 'Total Pendapatan' : 'Pendapatan'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-white">{walletBalance} Koin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <img 
              src={userPhoto || 'https://via.placeholder.com/40'} 
              alt="Profil" 
              className="h-10 w-10 rounded-full object-cover border border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{userEmail.split('@')[0]}</p>
              <button 
                onClick={handleLogout} 
                className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors mt-0.5 flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                Keluar Aplikasi
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Container dengan Padding Dinamis */}
      <main className={`flex-1 ml-64 transition-all duration-300 ${isChatRoom ? 'h-screen p-0 overflow-hidden' : 'min-h-screen p-8 sm:p-12 overflow-y-auto'}`}>
        {children}
      </main>
    </div>
  );
}