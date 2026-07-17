// app/admin/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalRevenue: 0
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { count: userCount } = await supabase.from('users_data').select('*', { count: 'exact', head: true });
      const { data: projects } = await supabase.from('premium_projects').select('*').order('created_at', { ascending: false });
      
      let revenue = 0;
      let activeCount = 0;
      
      if (projects) {
        projects.forEach(p => {
          if (p.is_active) activeCount++;
          // Hitung estimasi pendapatan berdasarkan paket
          if (p.paket?.includes('Proposal')) revenue += 1850000;
          if (p.paket?.includes('Semhas')) revenue += 4200000;
          if (p.paket?.includes('Complete')) revenue += 6200000;
        });
      }

      setStats({
        totalUsers: userCount || 0,
        totalProjects: projects?.length || 0,
        activeProjects: activeCount,
        totalRevenue: revenue
      });
      
      setRecentProjects(projects?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  if (loading) return <div className="p-10 flex justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Admin</h1>
        <p className="text-slate-500 mt-1">Ringkasan penjualan dan analitik platform Maululus.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Pendapatan</p>
          <h3 className="text-3xl font-black text-emerald-600">{formatRupiah(stats.totalRevenue)}</h3>
          <p className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit mt-2 font-bold">+ Estimasi Kotor</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total User Akun</p>
          <h3 className="text-3xl font-black text-blue-600">{stats.totalUsers}</h3>
          <p className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit mt-2 font-bold">Pengguna Terdaftar</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Proyek Aktif</p>
          <h3 className="text-3xl font-black text-amber-500">{stats.activeProjects}</h3>
          <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit mt-2 font-bold">Sedang Dikerjakan</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Pesanan</p>
          <h3 className="text-3xl font-black text-slate-800">{stats.totalProjects}</h3>
          <p className="text-[10px] text-slate-600 bg-slate-100 px-2 py-1 rounded w-fit mt-2 font-bold">Seluruh Waktu</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Pesanan Expert Assistance Terbaru</h3>
          <Link href="/admin/proyek" className="text-xs font-bold text-blue-600 hover:underline">Lihat Semua Proyek &rarr;</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="p-4 pl-6 font-bold">Klien & Kontak</th>
                <th className="p-4 font-bold">Paket Pesanan</th>
                <th className="p-4 font-bold">Tanggal</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.length > 0 ? recentProjects.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-800">{p.nama_lengkap || p.user_email}</p>
                    <p className="text-[10px] text-slate-500">WA: {p.no_whatsapp || '-'}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">{p.paket}</span>
                  </td>
                  <td className="p-4 text-xs">{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                    {p.is_active ? (
                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded text-[10px] font-bold uppercase">Aktif ({p.progress}%)</span>
                    ) : (
                      <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded text-[10px] font-bold uppercase">Menunggu ACC</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Belum ada pesanan masuk.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}