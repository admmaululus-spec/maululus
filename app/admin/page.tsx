'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const [adminName, setAdminName] = useState('Admin');
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Analitik Real dari Supabase
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSkripsi: 0,
    totalAnalyst: 0,
  });

  // State Dummy untuk Finansial & Traffic (Bisa dihubungkan ke DB nanti)
  const [finances] = useState({
    saldo: 12500000, // Rp 12.500.000
    kunjunganWeb: 1420,
    transaksiBulanIni: 45
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    
    // Ambil Session Admin
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      setAdminName(session.user.email.split('@')[0]);
    }

    // Ambil Data Real dari Database
    const { count: usersCount } = await supabase.from('users_data').select('*', { count: 'exact', head: true });
    const { count: skripsiCount } = await supabase.from('history_skripsi').select('*', { count: 'exact', head: true });
    // Menghitung jumlah analis dari tabel yang baru kita buat sebelumnya
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
    <div className="max-w-7xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Profile & Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-200">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Halo, {adminName}</h1>
            <p className="text-slate-500 font-medium mt-1">Pusat kendali operasional Maululus.</p>
          </div>
        </div>
        <button onClick={fetchDashboardData} className="mt-4 md:mt-0 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* SECTION 1: MAIN ANALYTICS (2 Columns Wide on Desktop) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card: Kunjungan Website */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Visitor Website</p>
            <h2 className="text-4xl font-black text-slate-900">{finances.kunjunganWeb}</h2>
            <p className="text-sm font-semibold text-emerald-500 mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
              +12% dari minggu lalu
            </p>
          </div>

          {/* Card: Total User */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-indigo-600"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total User</p>
            <h2 className="text-4xl font-black text-slate-900">{stats.totalUsers}</h2>
            <p className="text-sm font-semibold text-slate-500 mt-2">Terdaftar di database</p>
          </div>

          {/* Card: Generate Skripsi */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-orange-600"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dokumen Digenerate</p>
            <h2 className="text-4xl font-black text-slate-900">{stats.totalSkripsi}</h2>
            <p className="text-sm font-semibold text-slate-500 mt-2">Total histori skripsi</p>
          </div>

          {/* Card: Total Analis */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-emerald-600"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Analis Aktif</p>
            <h2 className="text-4xl font-black text-slate-900">{stats.totalAnalyst}</h2>
            <p className="text-sm font-semibold text-slate-500 mt-2">Siap melayani chat</p>
          </div>
        </div>

        {/* SECTION 2: FINANCIAL / WALLET (1 Column Wide) */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-48 h-48 text-amber-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg></div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Pendapatan (Wallet)</p>
            <h2 className="text-4xl font-black text-amber-400 tracking-tight">Rp {finances.saldo.toLocaleString('id-ID')}</h2>
            <p className="text-sm font-medium text-slate-300 mt-3">{finances.transaksiBulanIni} Transaksi masuk bulan ini</p>
          </div>
          <div className="mt-8 space-y-3">
            <Link href="/admin/transaksi" className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-3 rounded-xl font-bold flex justify-between items-center transition-colors">
              Cek Histori Transaksi
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </Link>
            <Link href="/admin/wallet" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-3 rounded-xl font-bold flex justify-between items-center transition-colors">
              Tarik Dana (Withdraw)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 3: QUICK ACTIONS / CRUD MANAGEMENT */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 mt-8">Manajemen Sistem (CRUD)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Action 1: Kelola Analis (Penting!) */}
          <Link href="/admin/analis" className="bg-indigo-50 border border-indigo-100 hover:border-indigo-300 p-5 rounded-2xl group transition-all">
            <div className="h-12 w-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </div>
            <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors">Tambah / Edit Analis</h3>
            <p className="text-sm text-slate-500 mt-1">Otomatis tampil di /analis</p>
          </Link>

          {/* Action 2: Kelola User */}
          <Link href="/admin/users" className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-2xl group transition-all">
            <div className="h-12 w-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Kelola User</h3>
            <p className="text-sm text-slate-500 mt-1">Cek data & hak akses user</p>
          </Link>

          {/* Action 3: Transaksi & Wallet */}
          <Link href="/admin/transaksi" className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-2xl group transition-all">
            <div className="h-12 w-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Validasi Pembayaran</h3>
            <p className="text-sm text-slate-500 mt-1">Cek transferan manual</p>
          </Link>

          {/* Action 4: Broadcast */}
          <Link href="/admin/broadcast" className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-2xl group transition-all">
            <div className="h-12 w-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Data Broadcast</h3>
            <p className="text-sm text-slate-500 mt-1">Tarik kontak marketing</p>
          </Link>

        </div>
      </div>

    </div>
  );
}