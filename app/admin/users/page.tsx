'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

type UserData = { 
  id: string; 
  koin: number; 
  is_pro: boolean; 
  whatsapp: string; 
  email?: string; 
  created_at: string;
  generate_count?: number; 
};
type HistoryData = { id: string; paket_nama: string; koin_jumlah: number; harga_rp: number; gross_amount?: number; metode: string; created_at: string };

// Tipe data untuk konfigurasi sorting
type SortConfig = {
  key: keyof UserData | null;
  direction: 'asc' | 'desc';
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk menyimpan nilai input koin kustom setiap user
  const [customKoin, setCustomKoin] = useState<Record<string, string>>({});
  
  // State untuk Sorting (Default: urutkan berdasarkan koin terbanyak / desc)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'koin', direction: 'desc' });
  
  // State untuk Modal Riwayat
  const [historyModal, setHistoryModal] = useState<{ show: boolean, user: UserData | null, records: HistoryData[], loading: boolean }>({ 
    show: false, user: null, records: [], loading: false 
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    
    // 1. Ambil data seluruh user
    const { data: usersData } = await supabase.from('users_data').select('*');
      
    // 2. Ambil data dari history_skripsi (Tabel yang sudah bisa diakses admin)
    const { data: skripsiData } = await supabase.from('history_skripsi').select('user_id');

    // 3. Ambil data riwayat AI
    const { data: aiHistoryData } = await supabase.from('ai_tools_history').select('user_id');

    if (usersData) {
      // 4. Gabungkan data user dengan jumlah riwayatnya
      const combinedUsers = usersData.map(user => {
        const countSkripsi = skripsiData ? skripsiData.filter(h => h.user_id === user.id).length : 0;
        const countAi = aiHistoryData ? aiHistoryData.filter(h => h.user_id === user.id).length : 0;
        return { ...user, generate_count: countSkripsi + countAi };
      });
      setUsers(combinedUsers);
    }
    
    setIsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // ==========================================
  // FUNGSI UPDATE KOIN DENGAN ERROR HANDLER & ORDER_ID + GROSS_AMOUNT
  // ==========================================
  const handleUpdateKoin = async (user: UserData, addAmount: number) => {
    setUpdatingId(user.id);
    const newKoin = user.koin + addAmount;
    
    // BUAT ORDER_ID UNIK AGAR TIDAK ERROR "NULL VALUE"
    const uniqueOrderId = `ADMIN-TOPUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    try {
      // Eksekusi update koin ke database
      const { error: updateError } = await supabase
        .from('users_data')
        .update({ koin: newKoin })
        .eq('id', user.id);
        
      if (updateError) throw updateError;

      // Eksekusi simpan riwayat transaksi (Wajib masukkan order_id dan gross_amount)
      const { error: insertError } = await supabase
        .from('transactions')
        .insert({
          order_id: uniqueOrderId, 
          user_id: user.id, 
          user_email: user.email || 'Tanpa Email', 
          paket_nama: 'Top Up Manual (Admin)',
          koin_jumlah: addAmount, 
          harga_rp: 0, 
          gross_amount: 0, // <--- PERBAIKAN: Menambahkan gross_amount agar tidak error Not-Null
          metode: 'Admin Action', 
          status: 'SUCCESS'
        });
        
      if (insertError) throw insertError;

      // JIKA BERHASIL: Update angka di layar dan hapus nilai input
      setUsers(users.map(u => u.id === user.id ? { ...u, koin: newKoin } : u));
      setCustomKoin({...customKoin, [user.id]: ''});
      alert(`Berhasil menambahkan ${addAmount} koin ke akun ${user.email || 'Klien'}`);

    } catch (err: any) {
      console.error("Gagal menambahkan koin:", err);
      alert(`GAGAL UPDATE: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // FUNGSI TOGGLE PRO DENGAN ERROR HANDLER
  // ==========================================
  const handleTogglePro = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('users_data')
        .update({ is_pro: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;

      setUsers(users.map(u => u.id === id ? { ...u, is_pro: !currentStatus } : u));
    } catch (err: any) {
      alert(`GAGAL UPDATE STATUS PRO: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const openHistoryModal = async (user: UserData) => {
    setHistoryModal({ show: true, user: user, records: [], loading: true });
    const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setHistoryModal({ show: true, user: user, records: data || [], loading: false });
  };

  // ==========================================
  // LOGIKA SORTING (PENGURUTAN)
  // ==========================================
  const handleSort = (key: keyof UserData) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = a[sortConfig.key] ?? ''; 
    let bValue = b[sortConfig.key] ?? '';

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredAndSortedUsers = sortedUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return user.email?.toLowerCase().includes(searchLower) || user.whatsapp?.toLowerCase().includes(searchLower) || user.id.toLowerCase().includes(searchLower);
  });

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

  const SortIcon = ({ columnKey }: { columnKey: keyof UserData }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-300 opacity-50 transition-opacity group-hover:opacity-100">
          <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.25 3.25a.75.75 0 11-1.06 1.06L10.5 5.31V14.69l2.22-2.22a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0l-3.25-3.25a.75.75 0 111.06-1.06l2.22 2.22V5.31L6.28 7.53a.75.75 0 01-1.06-1.06l3.25-3.25A.75.75 0 0110 3z" clipRule="evenodd" />
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600"><path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" /></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto p-8 font-sans">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kelola Pengguna</h1>
          <p className="text-slate-500 mt-1 text-sm">Manajemen koin, status PRO, riwayat pemakaian AI, dan top up.</p>
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
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 select-none">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px] cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('email')}>
                  <div className="flex items-center gap-1.5">Email / WhatsApp <SortIcon columnKey="email" /></div>
                </th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px] cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('koin')}>
                  <div className="flex items-center gap-1.5">Sisa Koin <SortIcon columnKey="koin" /></div>
                </th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px] cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('generate_count')}>
                  <div className="flex items-center gap-1.5">Total Generate <SortIcon columnKey="generate_count" /></div>
                </th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px] cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('is_pro')}>
                  <div className="flex items-center gap-1.5">Status Paket <SortIcon columnKey="is_pro" /></div>
                </th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px] text-right">Aksi Cepat</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                 <tr><td colSpan={5} className="px-6 py-12 text-center text-blue-600 font-bold animate-pulse">Memuat data pengguna...</td></tr>
              ) : filteredAndSortedUsers.length === 0 ? (
                 <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">Tidak ada pengguna yang cocok dengan pencarian.</td></tr>
              ) : (
                filteredAndSortedUsers.map((user) => (
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
                      <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                        {user.generate_count || 0} Kali
                      </span>
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
                    <td className="px-6 py-4 flex justify-end gap-2 items-center">
                      <button onClick={() => openHistoryModal(user)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors text-slate-600">Riwayat</button>
                      
                      {/* INPUT KOIN DINAMIS */}
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
                        <input 
                          type="number" 
                          placeholder="Jml" 
                          value={customKoin[user.id] || ''}
                          onChange={(e) => setCustomKoin({...customKoin, [user.id]: e.target.value})}
                          className="w-16 px-2 py-1.5 text-xs text-center outline-none text-slate-700 font-bold placeholder-slate-300"
                          min="1"
                        />
                        <button 
                          onClick={() => {
                            const amount = parseInt(customKoin[user.id]);
                            if (amount && amount !== 0) {
                              handleUpdateKoin(user, amount);
                            }
                          }} 
                          disabled={updatingId === user.id || !customKoin[user.id]} 
                          className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 border-l border-slate-200"
                        >
                          Top Up
                        </button>
                      </div>
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
                      {/* PERBAIKAN TAMPILAN NOMINAL: Mendukung format harga_rp atau gross_amount */}
                      <td className="p-4 font-bold text-slate-800">{(rec.harga_rp > 0 || (rec.gross_amount && rec.gross_amount > 0)) ? formatRp(rec.harga_rp || rec.gross_amount || 0) : '-'}</td>
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