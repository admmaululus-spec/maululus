'use client';

import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function UpgradePage() {
  const router = useRouter();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Pastikan komponen sudah terpasang di browser
  useEffect(() => {
    setIsMounted(true);
    
    // Cek apakah user sudah login, jika tidak tendang ke /auth
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
      }
    };
    checkAuth();
  }, [router]);

  const handleSimulasiBayar = async () => {
    setIsUpgrading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Sesi habis, silakan login kembali.");
        router.push('/auth');
        return;
      }

      // SIMULASI: Update status PRO dan tambah koin di Database
      // Gunakan koin: 11 (asumsi 1 koin gratis + 10 koin bonus pro)
      const { error } = await supabase
        .from('users_data')
        .update({ 
          is_pro: true, 
          koin: 11 
        })
        .eq('id', session.user.id);

      if (error) throw error;

      alert("Pembayaran Berhasil! Selamat kamu menjadi PRO Scholar.");
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      alert("Terjadi kesalahan saat memproses pembayaran.");
    } finally {
      setIsUpgrading(false);
    }
  };

  // Mencegah hydration error dengan tidak merender apa pun sebelum mounted
  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pilih Paket Belajarmu</h1>
        <p className="text-slate-500 mt-2 font-medium">Investasi terbaik untuk kelulusan tepat waktu.</p>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card Free - Unclickable */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 opacity-60 flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Free Plan</h2>
              <div className="text-4xl font-black mt-2 text-slate-400">Rp 0</div>
              <ul className="mt-8 space-y-4 text-sm text-slate-400 font-medium">
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    1 Koin Gratis (Awal)
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    Akses AI Copilot Terbatas
                  </li>
              </ul>
            </div>
            <button disabled className="mt-10 w-full bg-slate-100 text-slate-400 font-bold py-4 rounded-2xl cursor-not-allowed">
                Paket Aktif
            </button>
        </div>

        {/* Card Pro - The Active One */}
        <div className="bg-white p-10 rounded-[2.5rem] border-2 border-indigo-600 shadow-2xl shadow-indigo-500/20 relative flex flex-col justify-between transform transition-transform hover:scale-[1.02]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-5 py-1.5 rounded-full uppercase tracking-widest">Best Value</div>
            
            <div>
              <h2 className="font-bold text-indigo-600 uppercase text-xs tracking-widest">Pro Scholar</h2>
              <div className="text-4xl font-black mt-2 text-slate-900">Rp 49.000<span className="text-sm font-medium text-slate-400">/bulan</span></div>
              
              <ul className="mt-8 space-y-4 text-sm text-slate-600 font-bold">
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    Akses Penuh AI Copilot
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    Bonus 10 Koin / Bulan
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    Prioritas Cloud Update
                  </li>
              </ul>
            </div>

            <button 
                onClick={handleSimulasiBayar}
                disabled={isUpgrading}
                className="mt-10 w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 flex justify-center items-center gap-2"
            >
                {isUpgrading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                ) : "Upgrade Sekarang"}
            </button>
        </div>
      </div>

      <button onClick={() => router.back()} className="mt-8 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
        ← Kembali ke Dashboard
      </button>
    </div>
  );
}