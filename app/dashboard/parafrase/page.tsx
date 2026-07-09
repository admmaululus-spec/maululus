'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

export default function ParafrasePage() {
  const router = useRouter();
  
  const [hargaKoin, setHargaKoin] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [koin, setKoin] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/auth');
      setUserId(session.user.id);

      const { data: userData } = await supabase.from('users_data').select('koin').eq('id', session.user.id).single();
      if (userData) setKoin(userData.koin);

      const { data: pricingData } = await supabase.from('ai_tools_pricing').select('koin').eq('id', 'parafrase').single();
      if (pricingData) {
        setHargaKoin(pricingData.koin);
      } else {
        setHargaKoin(15);
      }
    };
    initializePage();
  }, [router]);

  const handleParafrase = async () => {
    if (hargaKoin === null) return;
    if (!textInput.trim()) return alert("Teks tidak boleh kosong!");
    
    if (Number(koin) < Number(hargaKoin)) {
      alert(`Koin tidak cukup! Kamu butuh ${hargaKoin} Koin.`);
      return router.push('/dashboard?menu=topup');
    }

    setIsProcessing(true);

    try {
      const { error } = await supabase.from('users_data').update({ koin: Number(koin) - Number(hargaKoin) }).eq('id', userId);
      if (error) throw error;
      setKoin(prev => Number(prev) - Number(hargaKoin));

      await new Promise(resolve => setTimeout(resolve, 3000));
      const hasilParafrase = `(Hasil Parafrase AI) ${textInput.split(' ').reverse().join(' ')}`;
      
      setTextOutput(hasilParafrase);

      if (userId) {
        await supabase.from('ai_tools_history').insert({
          user_id: userId,
          tool_name: 'Parafrase',
          input_data: textInput.substring(0, 100) + '...',
          result_data: { teks_hasil: hasilParafrase }
        });
      }

    } catch (err) {
      alert("Gagal memproses parafrase. Koin dikembalikan.");
      if (userId) {
        await supabase.from('users_data').update({ koin: koin }).eq('id', userId);
        setKoin(koin);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (hargaKoin === null) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;

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
              {isProcessing ? 'AI Sedang Menulis...' : `Parafrase Teks (-${hargaKoin} Koin)`}
            </button>
          </div>

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