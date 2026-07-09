'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

const ActionTooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="group relative flex-1">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover:block w-full p-2 bg-slate-800 text-white text-[9px] rounded shadow-lg z-50 text-center leading-tight">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

export default function CopilotPage() {
  const router = useRouter();
  
  const [hargaKoin, setHargaKoin] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [koin, setKoin] = useState(0);
  
  const [judulSkripsi, setJudulSkripsi] = useState('');
  const [namaBab, setNamaBab] = useState('');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/auth');
      setUserId(session.user.id);

      const { data: userData } = await supabase.from('users_data').select('koin').eq('id', session.user.id).single();
      if (userData) setKoin(userData.koin);

      const { data: priceData } = await supabase.from('ai_tools_pricing').select('koin').eq('id', 'copilot').single();
      setHargaKoin(priceData ? priceData.koin : 15);
    };
    initializePage();
  }, [router]);

  const handleProcessClick = async (action: 'paraphrase' | 'expand' | 'formalize') => {
    if (!inputText.trim()) return alert('Input teks kosong!');
    if (hargaKoin === null) return;
    
    if (Number(koin) < Number(hargaKoin)) {
      alert(`Koin tidak cukup! Butuh ${hargaKoin} Koin.`);
      return router.push('/dashboard?menu=topup');
    }

    setIsLoadingAI(true);
    
    try {
      const { error } = await supabase.from('users_data').update({ koin: Number(koin) - Number(hargaKoin) }).eq('id', userId);
      if (error) throw error;
      setKoin(prev => Number(prev) - Number(hargaKoin));

      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: inputText, 
          action: action,
          judulSkripsi: judulSkripsi.trim() || 'Tidak disebutkan',
          namaBab: namaBab.trim() || 'Bagian acak'
        }),
      });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      setOutputText(data.result);
      
      await supabase.from('ai_tools_history').insert({
        user_id: userId,
        tool_name: 'AI Draft Writer',
        input_data: inputText.substring(0, 100) + '...',
        result_data: { teks_hasil: data.result }
      });

    } catch (e: any) {
      alert(`Gagal memproses AI: ${e.message}`);
      await supabase.from('users_data').update({ koin: koin }).eq('id', userId);
    } finally {
      setIsLoadingAI(false);
    }
  };

  if (hargaKoin === null) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between">
        <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors tracking-tighter uppercase">← Kembali ke Dashboard</Link>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
          <span className="text-amber-500">🪙</span>
          <span className="text-sm font-bold text-slate-800">{koin} Koin</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[75vh]">
          
          <div className="flex flex-col gap-4">
            <div className="flex gap-3 animate-in fade-in slide-in-from-top-2">
              <input type="text" placeholder="Judul Skripsi (Opsional: untuk konteks AI)" value={judulSkripsi} onChange={(e) => setJudulSkripsi(e.target.value)} className="flex-[2] bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              <input type="text" placeholder="Bab/Bagian" value={namaBab} onChange={(e) => setNamaBab(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            </div>

            <div className="flex justify-between items-center h-4 mt-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Draf Teks Utama</h2>
              <button onClick={() => setInputText('')} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase transition-colors">Hapus</button>
            </div>
            
            <textarea 
              className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-700 outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed shadow-sm custom-scrollbar"
              placeholder="Masukkan draf paragraf, poin materi, atau teks kutipan di sini..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <div className="flex gap-2">
              <ActionTooltip text="Rombak susunan kalimat agar unik dan aman dari uji Turnitin.">
                <button onClick={() => handleProcessClick('paraphrase')} disabled={isLoadingAI} className="w-full bg-white border border-slate-200 text-slate-900 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wide hover:bg-slate-50 transition-all disabled:opacity-50">Parafrase</button>
              </ActionTooltip>
              <ActionTooltip text="Ubah kalimat pendek menjadi 1-2 paragraf akademik berbobot.">
                <button onClick={() => handleProcessClick('expand')} disabled={isLoadingAI} className="w-full bg-white border border-slate-200 text-slate-900 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wide hover:bg-slate-50 transition-all disabled:opacity-50">Kembangkan</button>
              </ActionTooltip>
              <ActionTooltip text="Koreksi struktur EYD/PUEBI menjadi bahasa skripsi baku.">
                <button onClick={() => handleProcessClick('formalize')} disabled={isLoadingAI} className="w-full bg-white border border-slate-200 text-slate-900 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wide hover:bg-slate-50 transition-all disabled:opacity-50">Formalize</button>
              </ActionTooltip>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center h-4 mt-12 sm:mt-0">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Keluaran AI</h2>
              {outputText && <button onClick={() => {navigator.clipboard.writeText(outputText); alert("Teks disalin ke clipboard!");}} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 uppercase transition-colors">Copy Teks</button>}
            </div>
            
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-slate-300 text-sm leading-loose overflow-y-auto whitespace-pre-line shadow-inner custom-scrollbar relative">
              {isLoadingAI ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-2xl z-10">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-emerald-500"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 animate-pulse">Menyusun Teks...</span>
                  </div>
                </div>
              ) : outputText || (
                <div className="h-full flex items-center justify-center text-slate-600 italic font-medium text-xs">Pilih mode aksi di panel sebelah kiri untuk memproses teks.</div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}