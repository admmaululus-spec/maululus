'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

export default function RingkasanJurnalPage() {
  const router = useRouter();
  const HARGA_KOIN = 3;

  const [userId, setUserId] = useState<string | null>(null);
  const [koin, setKoin] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/auth');
      setUserId(session.user.id);

      const { data } = await supabase.from('users_data').select('koin').eq('id', session.user.id).single();
      if (data) setKoin(data.koin);
    };
    fetchUser();
  }, [router]);

  const handleRingkasan = async () => {
    if (!textInput.trim()) return alert("Teks tidak boleh kosong!");
    if (koin < HARGA_KOIN) {
      alert(`Koin tidak cukup! Kamu butuh ${HARGA_KOIN} Koin.`);
      return router.push('/dashboard/upgrade');
    }

    setIsProcessing(true);

    try {
      // 1. Potong koin
      const { error } = await supabase.from('users_data').update({ koin: koin - HARGA_KOIN }).eq('id', userId);
      if (error) throw error;
      setKoin(prev => prev - HARGA_KOIN);

      // 2. Panggil API Ringkasan
      const res = await fetch('/api/ringkasan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput })
      });

      if (!res.ok) throw new Error("Gagal terhubung ke server AI");
      const data = await res.json();
      const hasilRingkasan = data.result;
      
      setTextOutput(hasilRingkasan);

      // 3. Simpan ke History Supabase
      if (userId) {
        await supabase.from('ai_tools_history').insert({
          user_id: userId,
          tool_name: 'Ringkasan Jurnal',
          input_data: textInput.substring(0, 100) + '...',
          result_data: { teks_hasil: hasilRingkasan }
        });
      }

    } catch (err) {
      alert("Gagal memproses ringkasan. Koin dikembalikan.");
      // Rollback koin otomatis
      if (userId) {
        await supabase.from('users_data').update({ koin: koin }).eq('id', userId);
        setKoin(koin);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold text-sm transition-colors">
            <span>&larr;</span> Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
            <span className="text-amber-500">🪙</span>
            <span className="text-sm font-bold text-slate-800">{koin} Koin</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-start gap-5">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl text-2xl shrink-0">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Ringkasan Jurnal</h1>
            <p className="text-slate-500 mt-2 text-sm max-w-xl">Pahami inti dari jurnal yang panjang dalam hitungan detik. Ekstrak Tujuan, Metode, dan Kesimpulan dengan cepat.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Input */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-700">Teks Asli / Abstrak Jurnal</h3>
            </div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Tempelkan abstrak atau isi teks jurnal panjang di sini..."
              className="flex-1 min-h-[300px] w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm resize-none outline-none focus:border-blue-500 transition-all"
            ></textarea>
            <button 
              onClick={handleRingkasan}
              disabled={isProcessing || !textInput}
              className="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'AI Sedang Membaca...' : `Buat Ringkasan (-${HARGA_KOIN} Koin)`}
            </button>
          </div>

          {/* Kolom Output */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 shadow-sm flex flex-col relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-blue-900">Hasil Rangkuman Poin</h3>
              {textOutput && (
                <button onClick={() => navigator.clipboard.writeText(textOutput)} className="text-xs font-bold text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-sm hover:scale-105 transition-transform">
                  Salin Teks
                </button>
              )}
            </div>
            
            {isProcessing ? (
               <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                 <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                 <p className="text-sm font-medium text-blue-600 animate-pulse">Menyaring informasi penting...</p>
               </div>
            ) : (
              <textarea
                value={textOutput}
                readOnly
                placeholder="Hasil poin-poin ringkasan akan muncul di sini..."
                className="flex-1 min-h-[300px] w-full bg-white/70 border border-blue-100/50 rounded-2xl p-5 text-sm resize-none outline-none text-slate-800 leading-relaxed"
              ></textarea>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}