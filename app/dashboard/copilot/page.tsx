'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

// === KOMPONEN TOOLTIP ACTION ===
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
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);
  
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  useEffect(() => {
    const checkProStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from('users_data').select('is_pro').eq('id', session.user.id).single();
      setIsPro(data?.is_pro || false);
      setIsLoadingCheck(false);
    };
    checkProStatus();
  }, []);

  const handleProcess = async (action: 'paraphrase' | 'expand' | 'formalize') => {
    if (!inputText.trim()) return alert('Input teks kosong!');
    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, action }),
      });
      const data = await response.json();
      setOutputText(data.result);
    } catch (e) {
      alert("Gagal memproses AI");
    } finally {
      setIsLoadingAI(false);
    }
  };

  if (isLoadingCheck) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"></div></div>;

  // TAMPILAN PAYWALL MODERN
  if (!isPro) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Akses Ditolak</p>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Fitur Khusus Pro</h1>
          <p className="text-slate-400 text-xs leading-relaxed mb-8">AI Copilot hanya tersedia untuk pengguna paket Pro Scholar. Akses fitur penulisan tingkat lanjut sekarang.</p>
          <Link href="/dashboard/upgrade" className="block w-full bg-slate-900 text-white font-bold py-3 text-xs rounded-xl hover:bg-slate-800 transition-all mb-3">Tingkatkan Paket</Link>
          <Link href="/dashboard" className="text-[10px] font-bold text-slate-400 uppercase hover:text-slate-600 transition-colors">Kembali</Link>
        </div>
      </div>
    );
  }

  // TAMPILAN TOOL AI MODERN & MINIMALIS
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6">
        <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors tracking-tighter uppercase">← Kembali ke Dashboard</Link>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[75vh]">
          
          {/* EDITOR SECTION */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center h-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Draf Teks</h2>
              <button onClick={() => setInputText('')} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase">Hapus</button>
            </div>
            
            <textarea 
              className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-700 outline-none resize-none focus:border-slate-400 transition-all leading-relaxed shadow-sm"
              placeholder="Masukkan draf paragraf, poin materi, atau teks kutipan di sini..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <div className="flex gap-2">
              <ActionTooltip text="Rombak susunan kalimat agar unik dan aman dari uji Turnitin.">
                <button onClick={() => handleProcess('paraphrase')} disabled={isLoadingAI} className="w-full bg-white border border-slate-200 text-slate-900 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wide hover:bg-slate-50 transition-all disabled:opacity-50">Parafrase</button>
              </ActionTooltip>
              <ActionTooltip text="Ubah kalimat pendek menjadi 1-2 paragraf akademik berbobot.">
                <button onClick={() => handleProcess('expand')} disabled={isLoadingAI} className="w-full bg-white border border-slate-200 text-slate-900 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wide hover:bg-slate-50 transition-all disabled:opacity-50">Kembangkan</button>
              </ActionTooltip>
              <ActionTooltip text="Koreksi struktur EYD/PUEBI menjadi bahasa skripsi yang sangat baku.">
                <button onClick={() => handleProcess('formalize')} disabled={isLoadingAI} className="w-full bg-white border border-slate-200 text-slate-900 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wide hover:bg-slate-50 transition-all disabled:opacity-50">Formalize</button>
              </ActionTooltip>
            </div>
          </div>
          
          {/* RESULT SECTION */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center h-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Keluaran AI</h2>
              {outputText && <button onClick={() => {navigator.clipboard.writeText(outputText); alert("Teks disalin ke clipboard!");}} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 uppercase">Copy Teks</button>}
            </div>
            
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-slate-300 text-sm leading-loose overflow-y-auto whitespace-pre-line shadow-inner">
              {isLoadingAI ? (
                <div className="flex items-center gap-3 opacity-50">
                  <div className="h-3 w-3 animate-pulse bg-slate-600 rounded-full"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Memproses Permintaan...</span>
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