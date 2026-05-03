'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

// Tambahkan 'email' ke dalam tipe data
type UserData = { id: string; koin: number; is_pro: boolean; whatsapp: string; email?: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // State untuk Fitur Pencarian
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    // Tarik data terbaru (termasuk kolom email jika sudah dibuat di Supabase)
    const { data } = await supabase.from('users_data').select('*').order('koin', { ascending: false });
    if (data) setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // Update Koin
  const handleUpdateKoin = async (id: string, currentKoin: number, addAmount: number) => {
    setUpdatingId(id);
    const newKoin = currentKoin + addAmount;
    await supabase.from('users_data').update({ koin: newKoin }).eq('id', id);
    setUsers(users.map(u => u.id === id ? { ...u, koin: newKoin } : u));
    setUpdatingId(null);
  };

  // Toggle PRO Status
  const handleTogglePro = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    await supabase.from('users_data').update({ is_pro: !currentStatus }).eq('id', id);
    setUsers(users.map(u => u.id === id ? { ...u, is_pro: !currentStatus } : u));
    setUpdatingId(null);
  };

  // Logika Filter Pencarian Berdasarkan Email, WA, atau ID
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchEmail = user.email?.toLowerCase().includes(searchLower);
    const matchWa = user.whatsapp?.toLowerCase().includes(searchLower);
    const matchId = user.id.toLowerCase().includes(searchLower);
    return matchEmail || matchWa || matchId;
  });

  if (isLoading) return <div className="text-slate-400 font-bold animate-pulse">Memuat data pengguna...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Kelola Pengguna</h1>
          <p className="text-slate-500 mt-1 text-sm">Manajemen koin dan status langganan PRO mahasiswa.</p>
        </div>
        
        {/* FITUR PENCARIAN (SEARCH BAR) */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          </div>
          <input
            type="text"
            placeholder="Cari email, WA, atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Email / WhatsApp</th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Sisa Koin</th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Status Paket</th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px] text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      {user.email ? user.email : <span className="text-slate-400 italic font-normal">Email belum disinkronisasi</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
                       {user.whatsapp || 'Tidak ada WA'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">{user.koin} 🪙</span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleTogglePro(user.id, user.is_pro)}
                      disabled={updatingId === user.id}
                      className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg border transition-all ${user.is_pro ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {user.is_pro ? '💎 PRO' : 'BASIC'}
                    </button>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button onClick={() => handleUpdateKoin(user.id, user.koin, 1)} disabled={updatingId === user.id} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors active:scale-95 disabled:opacity-50 text-slate-700">+1 Koin</button>
                    <button onClick={() => handleUpdateKoin(user.id, user.koin, 5)} disabled={updatingId === user.id} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors active:scale-95 disabled:opacity-50">+5 Koin</button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">Tidak ada pengguna yang cocok dengan pencarian.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}