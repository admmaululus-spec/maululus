'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

export default function ParafrasePage() {
  const router = useRouter();
  const HARGA_KOIN = 15;

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

  const handleParafrase = async () => {
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

      // 2. Panggil API Parafrase (Nanti ganti dengan fetch ke /api/parafrase)
      // Simulasi proses AI:
      await new Promise(resolve => setTimeout(resolve, 3000));
      const hasilParafrase = `(Ini adalah hasil parafrase AI) ${textInput.split(' ').reverse().join(' ')}`;
      
      setTextOutput(hasilParafrase);

      // 3. Simpan ke History Supabase
      if (userId) {
        await supabase.from('ai_tools_history').insert({
          user_id: userId,
          tool_name: 'Parafrase',
          input_data: textInput.substring(0, 100) + '...', // Simpan sedikit cuplikan awalnya saja
          result_data: { teks_hasil: hasilParafrase } // Simpan dalam format JSON
        });
      }

    } catch (err) {
      alert("Gagal memproses parafrase. Koin dikembalikan.");
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
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold text-sm transition-colors">
            <span>&larr;</span> Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
            <span className="text-amber-500">🪙</span>
            <span className="text-sm font-bold text-slate-800">{koin} Koin</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl text-2xl mb-4">🔄</div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Parafrase</h1>
          <p className="text-slate-500 mt-2">Tulis ulang kalimat skripsimu agar lolos Turnitin dengan bahasa akademis yang natural.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Input */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-700">Teks Asli</h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">Max 500 Kata</span>
            </div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Tempelkan paragraf yang ingin di-parafrase di sini..."
              className="flex-1 min-h-[300px] w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm resize-none outline-none focus:border-indigo-500 transition-all"
            ></textarea>
            <button 
              onClick={handleParafrase}
              disabled={isProcessing || !textInput}
              className="w-full mt-4 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'AI Sedang Menulis...' : `Parafrase Teks (-${HARGA_KOIN} Koin)`}
            </button>
          </div>

          {/* Kolom Output */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm flex flex-col relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-indigo-900">Hasil Parafrase</h3>
              {textOutput && (
                <button onClick={() => navigator.clipboard.writeText(textOutput)} className="text-xs font-bold text-indigo-600 bg-white px-3 py-1 rounded-lg shadow-sm hover:scale-105 transition-transform">
                  Salin Teks
                </button>
              )}
            </div>
            
            {isProcessing ? (
               <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                 <div className="flex gap-2">
                   <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                   <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                   <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 </div>
                 <p className="text-sm font-medium text-indigo-600 animate-pulse">Menyesuaikan gaya bahasa...</p>
               </div>
            ) : (
              <textarea
                value={textOutput}
                readOnly
                placeholder="Hasil tulisan AI akan muncul di sini..."
                className="flex-1 min-h-[300px] w-full bg-white/50 border border-indigo-100/50 rounded-2xl p-4 text-sm resize-none outline-none text-slate-800"
              ></textarea>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}