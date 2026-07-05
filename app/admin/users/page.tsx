'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

type UserData = { id: string; koin: number; is_pro: boolean; whatsapp: string; email?: string; created_at: string };
type HistoryData = { id: string; paket_nama: string; koin_jumlah: number; harga_rp: number; metode: string; created_at: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk Modal Riwayat
  const [historyModal, setHistoryModal] = useState<{ show: boolean, user: UserData | null, records: HistoryData[], loading: boolean }>({ 
    show: false, user: null, records: [], loading: false 
  });

  const fetchUsers = async () => {
    const { data } = await supabase.from('users_data').select('*').order('koin', { ascending: false });
    if (data) setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // Update Koin + Catat Riwayat ke tabel transactions
  const handleUpdateKoin = async (user: UserData, addAmount: number) => {
    setUpdatingId(user.id);
    const newKoin = user.koin + addAmount;
    
    try {
      // 1. Update koin di users_data
      await supabase.from('users_data').update({ koin: newKoin }).eq('id', user.id);
      
      // 2. Catat ke tabel transactions (TIDAK LAGI topup_history)
      await supabase.from('transactions').insert({
        user_id: user.id,
        user_email: user.email || 'Tanpa Email',
        paket_nama: 'Top Up Manual (Admin)',
        koin_jumlah: addAmount,
        harga_rp: 0,
        metode: 'Admin Action',
        status: 'SUCCESS'
      });

      // 3. Perbarui UI state
      setUsers(users.map(u => u.id === user.id ? { ...u, koin: newKoin } : u));
    } catch (err) {
      alert("Gagal menambahkan koin.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Toggle PRO Status
  const handleTogglePro = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    await supabase.from('users_data').update({ is_pro: !currentStatus }).eq('id', id);
    setUsers(users.map(u => u.id === id ? { ...u, is_pro: !currentStatus } : u));
    setUpdatingId(null);
  };

  // Buka Modal Riwayat Topup
  const openHistoryModal = async (user: UserData) => {
    setHistoryModal({ show: true, user: user, records: [], loading: true });
    // Tarik riwayat dari tabel transactions
    const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setHistoryModal({ show: true, user: user, records: data || [], loading: false });
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return user.email?.toLowerCase().includes(searchLower) || user.whatsapp?.toLowerCase().includes(searchLower) || user.id.toLowerCase().includes(searchLower);
  });

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto p-8 font-sans">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kelola Pengguna</h1>
          <p className="text-slate-500 mt-1 text-sm">Manajemen koin, status PRO, dan riwayat top up mahasiswa.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          </div>
          <input
            type="text"
            placeholder="Cari email, WA, atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Email / WhatsApp</th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Sisa Koin</th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Status Paket</th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px] text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                 <tr><td colSpan={4} className="px-6 py-12 text-center text-blue-600 font-bold animate-pulse">Memuat data pengguna...</td></tr>
              ) : filteredUsers.length === 0 ? (
                 <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">Tidak ada pengguna yang cocok dengan pencarian.</td></tr>
              ) : (
                filteredUsers.map((user) => (
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
                      <span className="font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">{user.koin} 🪙</span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleTogglePro(user.id, user.is_pro)}
                        disabled={updatingId === user.id}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg border transition-all ${user.is_pro ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        {user.is_pro ? '💎 PRO' : 'BASIC'}
                      </button>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button onClick={() => openHistoryModal(user)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors text-slate-600">Riwayat</button>
                      <button onClick={() => handleUpdateKoin(user, 1)} disabled={updatingId === user.id} className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-50">+1 Koin</button>
                      <button onClick={() => handleUpdateKoin(user, 5)} disabled={updatingId === user.id} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm">+5 Koin</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal History Transaksi */}
      {historyModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setHistoryModal({ show: false, user: null, records: [], loading: false })} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 rounded-full font-bold transition-colors">✕</button>
            
            <h3 className="text-xl font-black text-slate-800 mb-1">Riwayat Top Up & Transaksi</h3>
            <p className="text-xs text-slate-500 mb-6">Akun klien: <span className="font-bold text-blue-600">{historyModal.user?.email || 'N/A'}</span></p>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[10px] sticky top-0 shadow-sm">
                  <tr>
                    <th className="p-4 font-bold">Tanggal</th>
                    <th className="p-4 font-bold">Paket / Layanan</th>
                    <th className="p-4 font-bold">Nominal (Rp)</th>
                    <th className="p-4 font-bold">Koin</th>
                  </tr>
                </thead>
                <tbody>
                  {historyModal.loading ? (
                    <tr><td colSpan={4} className="p-10 text-center text-blue-600 font-bold animate-pulse">Mengambil riwayat...</td></tr>
                  ) : historyModal.records.length > 0 ? historyModal.records.map((rec) => (
                    <tr key={rec.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="p-4 text-xs font-medium text-slate-500">{new Date(rec.created_at).toLocaleString('id-ID')}</td>
                      <td className="p-4 font-bold text-slate-700">
                        {rec.paket_nama}
                        <div className="text-[9px] text-slate-400 font-normal mt-0.5">{rec.metode}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-800">{rec.harga_rp > 0 ? formatRp(rec.harga_rp) : '-'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${rec.koin_jumlah > 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                          {rec.koin_jumlah > 0 ? `+${rec.koin_jumlah} Koin` : `${rec.koin_jumlah} Koin`}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="p-10 text-center text-slate-400 font-medium">Belum ada riwayat top up.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}