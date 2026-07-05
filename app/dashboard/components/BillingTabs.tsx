'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { CoinIcon, WalletIcon, ReceiptIcon, SparklesIcon } from './IconsAndUI';

// ================= 1. TAB SALDO KOIN =================
export function TabKoin({ koin, riwayatList, setActiveMenu }: any) {
  const riwayatTransaksi = riwayatList.filter((item: any) => item.tool_name).slice(0, 8);

  return (
    <div className="animate-in fade-in max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><CoinIcon /></span>
        <h2 className="text-2xl font-extrabold text-slate-800">Saldo Koin</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kartu Saldo */}
        <div className="md:col-span-1 bg-gradient-to-br from-[#0B1525] to-[#1a2d4c] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-[250px]">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-48 h-48"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.1-.96-2.15-1.64H8.04c.05 1.63 1.25 2.66 2.86 2.98V19h2.34v-1.67c1.7-.32 2.95-1.32 2.95-3.03 0-2.14-1.73-2.79-3.88-3.16z"/></svg>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Total Koin Tersedia</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl">🪙</span>
              <span className="text-5xl font-black">{koin}</span>
            </div>
          </div>
          <div className="relative z-10">
            <button onClick={() => setActiveMenu('topup')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg active:scale-95">
              + Top Up Koin
            </button>
          </div>
        </div>

        {/* Tabel Riwayat */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><ReceiptIcon /> Riwayat Pemakaian AI Tools</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Tanggal</th>
                  <th className="px-4 py-3">Aktivitas / Fitur</th>
                  <th className="px-4 py-3 text-right rounded-tr-xl">Status Koin</th>
                </tr>
              </thead>
              <tbody>
                {riwayatTransaksi.length > 0 ? riwayatTransaksi.map((item: any, idx: number) => {
                  let deduct = 1;
                  if (item.tool_name === 'Turnitin Check') deduct = 20;
                  else if (item.tool_name === 'Parafrase' || item.tool_name === 'AI Draft Writer') deduct = 15;
                  else if (item.tool_name === 'Cari Jurnal' || item.tool_name === 'Buat Judul') deduct = 5;
                  else if (item.tool_name === 'Ringkasan Jurnal') deduct = 3;
                  else if (item.tool_name === 'Generate Sitasi') deduct = 2;

                  return (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs font-medium">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700 flex items-center gap-2">
                        <span className="text-blue-500"><SparklesIcon /></span> Menggunakan {item.tool_name}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-500">- {deduct} Koin</td>
                    </tr>
                  )
                }) : (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-xs">Belum ada riwayat transaksi AI.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= 2. TAB TOP UP KOIN (DENGAN MIDTRANS) =================
export function TabTopup({ koin }: any) {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      const { data } = await supabase.from('coin_packages').select('*').order('harga', { ascending: true });
      if (data) setPackages(data);
      setLoading(false);
    };
    fetchPackages();
  }, []);

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

  const handleBuyCoin = async (pkg: any) => {
    setIsProcessing(pkg.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return alert("Silakan login kembali.");

      const orderId = `COIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // 1. Minta Token Snap ke API Midtrans
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          gross_amount: pkg.harga,
          first_name: session.user.email?.split('@')[0] || 'User',
          email: session.user.email,
          phone: '-',
          item_name: `Top Up ${pkg.koin} Koin Maululus`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. Panggil Pop-Up Midtrans
      (window as any).snap.pay(data.token, {
        onSuccess: async function(result: any) {
          // JIKA BAYAR BERHASIL, TAMBAH KOIN KE DATABASE USER
          const { data: currentUser } = await supabase.from('users_data').select('koin').eq('id', session.user.id).single();
          const currentKoin = currentUser ? currentUser.koin : 0;
          
          await supabase.from('users_data').update({ koin: currentKoin + pkg.koin }).eq('id', session.user.id);
          
          alert(`Berhasil! ${pkg.koin} Koin telah ditambahkan ke akun Anda.`);
          window.location.reload();
        },
        onPending: function() {
          alert("Selesaikan pembayaran untuk menerima koin.");
          setIsProcessing(null);
        },
        onError: function() {
          alert("Pembayaran gagal!");
          setIsProcessing(null);
        },
        onClose: function() {
          setIsProcessing(null);
        }
      });
    } catch (err: any) {
      alert("Gagal memproses gateway: " + err.message);
      setIsProcessing(null);
    }
  };

  return (
    <div className="animate-in fade-in max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><WalletIcon /></span>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">Top Up Koin</h2>
            <p className="text-sm text-slate-500">Beli koin untuk menggunakan seluruh fitur canggih AI Maululus.</p>
          </div>
        </div>
      </div>

      {loading ? (
         <div className="flex justify-center py-20">
           <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-colors ${pkg.is_best_seller ? 'border-amber-400 bg-amber-50/20 transform md:-translate-y-4 relative shadow-xl' : 'border-slate-200 hover:border-blue-300'}`}>
              
              {pkg.is_best_seller && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap">
                  Paling Populer
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1 mt-2">{pkg.nama}</h3>
                <p className="text-[10px] text-slate-500 mb-6">{pkg.deskripsi}</p>
                
                <div className="flex items-end gap-2 mb-6 border-b border-slate-200/50 pb-6">
                  <span className={`text-5xl font-black ${pkg.is_best_seller ? 'text-amber-500' : 'text-slate-800'}`}>{pkg.koin}</span>
                  <span className="text-sm font-bold text-slate-500 mb-1.5">Koin</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <span className={`${pkg.is_best_seller ? 'text-amber-500' : 'text-blue-500'}`}>✔</span> Akses semua AI Tools
                  </li>
                  <li className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <span className={`${pkg.is_best_seller ? 'text-amber-500' : 'text-blue-500'}`}>✔</span> Tanpa masa hangus
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => handleBuyCoin(pkg)} 
                disabled={isProcessing === pkg.id}
                className={`w-full font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 ${pkg.is_best_seller ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30' : 'bg-slate-50 border border-slate-200 text-blue-700 hover:bg-slate-100'}`}
              >
                {isProcessing === pkg.id ? 'Memproses...' : `Beli ${formatRp(pkg.harga)}`}
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}