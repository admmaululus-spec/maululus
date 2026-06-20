'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const [adminName, setAdminName] = useState('Admin');
  const [isLoading, setIsLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSkripsi: 0,
    totalAnalyst: 0,
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) setAdminName(session.user.email.split('@')[0]);

    // Mengambil data ASLI dari Database Supabase
    const { count: usersCount } = await supabase.from('users_data').select('*', { count: 'exact', head: true });
    const { count: skripsiCount } = await supabase.from('history_skripsi').select('*', { count: 'exact', head: true });
    const { count: analystCount } = await supabase.from('analyst_profiles').select('*', { count: 'exact', head: true });

    setStats({
      totalUsers: usersCount || 0,
      totalSkripsi: skripsiCount || 0,
      totalAnalyst: analystCount || 0,
    });
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
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
        <button onClick={fetchDashboardData} className="mt-4 md:mt-0 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total User Terdaftar</p>
          <h2 className="text-5xl font-black text-slate-900">{stats.totalUsers}</h2>
          <p className="text-sm font-semibold text-slate-500 mt-2">Data Realtime Users</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dokumen Digenerate</p>
          <h2 className="text-5xl font-black text-slate-900">{stats.totalSkripsi}</h2>
          <p className="text-sm font-semibold text-slate-500 mt-2">Data History Skripsi</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Analis Aktif</p>
          <h2 className="text-5xl font-black text-slate-900">{stats.totalAnalyst}</h2>
          <p className="text-sm font-semibold text-slate-500 mt-2">Siap melayani chat</p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/admin/analis" className="bg-blue-50 border border-blue-100 p-5 rounded-2xl group transition-all">
            <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700">Tambah / Edit Analis</h3>
          </Link>
          <Link href="/admin/users" className="bg-white border border-slate-200 p-5 rounded-2xl group transition-all">
            <h3 className="font-bold text-slate-800 text-lg">Kelola Koin User</h3>
          </Link>
          <Link href="/admin/broadcast" className="bg-white border border-slate-200 p-5 rounded-2xl group transition-all">
            <h3 className="font-bold text-slate-800 text-lg">Data Broadcast</h3>
          </Link>
        </div>
      </div>
    </div>
  );
}