'use client';
import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { supabase } from '@/app/lib/supabase';

// Helper Component untuk Item Paket Koin di Right Panel
const CoinPackageSmall = ({ nama, koin, price, isBest, onClick, isProcessing }: any) => (
  <button 
    onClick={onClick}
    disabled={isProcessing}
    className={`w-full flex justify-between items-center p-3 rounded-xl border text-left transition-all disabled:opacity-50
      ${isBest ? 'bg-amber-50 border-amber-200 hover:border-amber-400 hover:shadow-sm' : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-sm'}`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${isBest ? 'bg-amber-200' : 'bg-slate-100'}`}>
        🪙
      </div>
      <div>
        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          {nama} {isBest && <span className="text-[8px] bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Populer</span>}
        </div>
        <div className="text-[10px] text-slate-500 font-medium">{koin} Koin</div>
      </div>
    </div>
    <div className="text-xs font-black text-slate-900">{price}</div>
  </button>
);

export default function RightPanel({ activeMenu, setActiveMenu, koin, isPro }: any) {
  const [packages, setPackages] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Tentukan URL Script Midtrans
  const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
  const midtransUrl = isProd
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';

  useEffect(() => {
    const fetchPackages = async () => {
      // Mengambil data persis seperti di BillingTabs.tsx (limit 5 untuk di panel samping agar tidak terlalu panjang)
      const { data } = await supabase.from('coin_packages').select('*').order('harga', { ascending: true }).limit(5);
      if (data) setPackages(data);
    };
    fetchPackages();
  }, []);

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

  // Fungsi Pembayaran Langsung dari Right Panel
  const handleQuickBuy = async (pkg: any) => {
    setIsProcessing(pkg.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return alert("Silakan login kembali.");

      const orderId = `COIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          gross_amount: pkg.harga,
          first_name: session.user.email?.split('@')[0] || 'User',
          email: session.user.email,
          phone: '-',
          item_name: pkg.nama // Menggunakan nama paket dari database
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      (window as any).snap.pay(data.token, {
        onSuccess: function(result: any) {
          alert("Pembayaran berhasil diproses! Koin akan segera masuk ke akun Anda.");
          setTimeout(() => window.location.reload(), 3000); 
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
      alert("Error: " + err.message);
      setIsProcessing(null);
    }
  };

  return (
    <>
      {/* Script Midtrans diload diam-diam di panel kanan */}
      <Script src={midtransUrl} data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} strategy="lazyOnload" />

      <aside className="hidden 2xl:block w-[340px] bg-white border-l border-slate-200 flex-col h-full overflow-y-auto custom-scrollbar shrink-0">
        <div className="p-6 space-y-8">
          
          {/* Menu Dashboard Aktif */}
          {activeMenu === 'dashboard' && (
            <div className="animate-in fade-in duration-500 space-y-8">
              {/* Saldo Koin */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Saldo Koin Anda</h3>
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-10 text-9xl pointer-events-none">🪙</div>
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                      <div className="bg-white/20 p-2 rounded-full text-amber-300 text-xl backdrop-blur-sm shadow-inner">🪙</div>
                      <span className="text-3xl font-black">{koin} <span className="text-sm font-medium text-blue-200">Koin</span></span>
                  </div>
                  <button 
                    onClick={() => setActiveMenu('topup')} 
                    className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 border border-white/20 py-2.5 rounded-xl text-sm font-bold transition-all relative z-10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    Top Up Koin
                  </button>
                </div>
              </div>

              {/* Quick Buy Paket Koin dari Database */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <h3 className="text-sm font-bold text-slate-800">Top Up Cepat</h3>
                  <button onClick={() => setActiveMenu('topup')} className="text-[10px] text-blue-600 font-bold hover:underline">Lihat Semua →</button>
                </div>
                <div className="space-y-2">
                   {packages.length > 0 ? packages.map(pkg => (
                     <CoinPackageSmall 
                       key={pkg.id} 
                       nama={pkg.nama}
                       koin={pkg.koin} 
                       price={formatRp(pkg.harga)} 
                       isBest={pkg.is_best_seller} 
                       onClick={() => handleQuickBuy(pkg)}
                       isProcessing={isProcessing === pkg.id}
                     />
                   )) : (
                     <div className="text-xs text-center text-slate-400 py-4 bg-slate-50 rounded-xl">Memuat paket...</div>
                   )}
                </div>
              </div>

              {/* Promo / Bantuan Expert*/}
              <div className="bg-[#0B1525] rounded-2xl p-5 relative overflow-hidden text-center cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all group" onClick={() => setActiveMenu('expert')}>
                 <h4 className="text-sm font-bold text-white mb-2 relative z-10 group-hover:text-amber-400 transition-colors">Butuh bantuan personal?</h4>
                 <p className="text-[10px] text-slate-400 mb-4 relative z-10">Tingkatkan ke Expert Assistance dan didampingi expert berpengalaman.</p>
                 <button className="bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-bold py-2 px-4 rounded-xl relative z-10 shadow-lg shadow-amber-500/30 w-full transition-all">Lihat Layanan Premium</button>
                 <div className="absolute -bottom-6 -right-6 text-7xl opacity-20 transition-transform group-hover:scale-110">🏆</div>
              </div>
            </div>
          )}

          {/* Menu Pengaturan Aktif */}
          {activeMenu === 'pengaturan' && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <h3 className="text-sm font-bold text-slate-800">Status Langganan</h3>
              <div className="bg-[#0D1C2E] border border-[#1a3556] rounded-2xl p-6 relative overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">Status Akun</p>
                <p className={`text-xl font-black mb-6 relative z-10 ${isPro ? 'text-emerald-400' : 'text-white'}`}>{isPro ? 'PRO SCHOLAR' : 'REGULER USER'}</p>
                
                <div className="mb-6 relative z-10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo Tersedia</p>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">🪙</span>
                    <span className="text-2xl font-black text-white">{koin} <span className="text-sm font-medium text-slate-400">Koin</span></span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setActiveMenu('topup')} 
                  className="block text-center w-full bg-white text-[#0D1C2E] py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors relative z-10"
                >
                  Top Up Koin Sekarang
                </button>
              </div>
            </div>
          )}
          
        </div>
      </aside>
    </>
  );
}