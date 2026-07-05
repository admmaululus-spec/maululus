'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function KursHeader() {
  const [koinRate, setKoinRate] = useState(0);

  useEffect(() => {
    fetchKurs();
  }, []);

  const fetchKurs = async () => {
    const { data } = await supabase.from('app_settings').select('value').eq('key', 'koin_rate').single();
    if (data) setKoinRate(parseInt(data.value));
  };

  const handleUpdateKurs = async () => {
    const val = prompt("Masukkan harga rupiah untuk 1 Koin (Contoh: 500):", koinRate.toString());
    if (val && !isNaN(Number(val))) {
      await supabase.from('app_settings').update({ value: val }).eq('key', 'koin_rate');
      setKoinRate(Number(val));
      alert("Kurs Koin berhasil diperbarui!");
    }
  };

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

  return (
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pengaturan Harga Web</h1>
        <p className="text-slate-500 mt-1">Atur harga produk, tarif koin, dan diskon terpusat.</p>
      </div>
      <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kurs Saat Ini</p>
        <div className="flex items-center gap-2">
          <span className="text-xl">🪙</span>
          <span className="text-xl font-black text-slate-800">1 = {formatRp(koinRate)}</span>
          <button onClick={handleUpdateKurs} className="ml-3 text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors">
            Ubah Kurs
          </button>
        </div>
      </div>
    </div>
  );
}