'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSkripsi: 0,
    totalAnalyst: 0,
    totalPendapatanRupiah: 0,
    totalKoinBeredar: 0,
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) setAdminName(session.user.email.split('@')[0]);

    // 1. Mengambil data count dasar
    const { count: usersCount } = await supabase.from('users_data').select('*', { count: 'exact', head: true });
    const { count: skripsiCount } = await supabase.from('history_skripsi').select('*', { count: 'exact', head: true });
    const { count: analystCount } = await supabase.from('analyst_profiles').select('*', { count: 'exact', head: true });

    // 2. Mengambil Total Pendapatan Rupiah (Dari Midtrans)
    const { data: txData } = await supabase
      .from('transactions')
      .select('gross_amount, koin_amount')
      .eq('status', 'settlement');

    let rupiah = 0;
    let koinDibeli = 0;

    if (txData) {
      txData.forEach(tx => {
        rupiah += Number(tx.gross_amount);
        koinDibeli += Number(tx.koin_amount);
      });
    }

    setStats({
      totalUsers: usersCount || 0,
      totalSkripsi: skripsiCount || 0,
      totalAnalyst: analystCount || 0,
      totalPendapatanRupiah: rupiah,
      totalKoinBeredar: koinDibeli,
    });
    
    setIsLoading(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/auth'); 
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER ADMIN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-200">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Halo, {adminName}</h1>
            <p className="text-slate-500 font-medium mt-1">Pusat kendali operasional database Maululus.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button onClick={fetchDashboardData} className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
            Refresh Data
          </button>
          
          <button onClick={handleLogout} disabled={isLoggingOut} className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-100 transition-all text-sm flex items-center gap-2 disabled:opacity-70">
            {isLoggingOut ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600"></div> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>}
            Keluar
          </button>
        </div>
      </div>

      {/* STATISTIK UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        <div className="bg-[#0D1C2E] p-8 rounded-3xl border border-[#1a3556] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pendapatan Bersih</p>
          <h2 className="text-3xl font-black text-white">Rp {stats.totalPendapatanRupiah.toLocaleString('id-ID')}</h2>
          <p className="text-sm font-semibold text-emerald-400 mt-2">Dari Top-Up Koin</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Koin Terjual</p>
          <h2 className="text-4xl font-black text-slate-900">{stats.totalKoinBeredar}</h2>
          <p className="text-sm font-semibold text-amber-500 mt-2">Beredar di User</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total User</p>
          <h2 className="text-4xl font-black text-slate-900">{stats.totalUsers}</h2>
          <p className="text-sm font-semibold text-blue-600 mt-2">Pendaftar Aktif</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dokumen / Analis</p>
          <h2 className="text-4xl font-black text-slate-900">{stats.totalSkripsi} <span className="text-xl text-slate-300">/ {stats.totalAnalyst}</span></h2>
          <p className="text-sm font-semibold text-indigo-600 mt-2">Skripsi AI Digenerate</p>
        </div>
      </div>

      {/* AKSES CEPAT */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/admin/analis" className="bg-blue-50 hover:bg-blue-100 border border-blue-100 p-5 rounded-2xl group transition-all">
            <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700">Tambah / Edit Analis</h3>
          </Link>
          <Link href="/admin/users" className="bg-white hover:bg-slate-50 border border-slate-200 p-5 rounded-2xl group transition-all">
            <h3 className="font-bold text-slate-800 text-lg">Kelola Koin User</h3>
          </Link>
          <Link href="/admin/broadcast" className="bg-white hover:bg-slate-50 border border-slate-200 p-5 rounded-2xl group transition-all">
            <h3 className="font-bold text-slate-800 text-lg">Data Broadcast</h3>
          </Link>
        </div>
      </div>
      
    </div>
  );
}