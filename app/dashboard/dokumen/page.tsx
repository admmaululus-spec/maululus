'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

type SubBab = { judul: string; deskripsi: string; url_asli?: string };
type OutlineData = { bab: string; subBab: SubBab[] };

function DokumenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idSkripsi = searchParams.get('id'); 
  
  const [judulTarget, setJudulTarget] = useState<string>('');
  const [outline, setOutline] = useState<OutlineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States Koin & User
  const [hargaKoin, setHargaKoin] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [koin, setKoin] = useState(0);

  // States Copilot & Modal
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeSub, setActiveSub] = useState<{judul: string, deskripsi: string} | null>(null);
  const [copilotResult, setCopilotResult] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  useEffect(() => {
    if (!idSkripsi) return router.push('/dashboard');

    const fetchDokumen = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/auth');
      setUserId(session.user.id);

      const { data: userData } = await supabase.from('users_data').select('koin').eq('id', session.user.id).single();
      if (userData) setKoin(userData.koin);

      const { data: priceData } = await supabase.from('ai_tools_pricing').select('koin').eq('id', 'copilot').single();
      setHargaKoin(priceData ? priceData.koin : 15);

      const { data, error } = await supabase.from('history_skripsi').select('*').eq('id', idSkripsi).eq('user_id', session.user.id).single();

      if (error || !data || !data.is_unlocked) {
        alert("Dokumen terkunci atau tidak ditemukan.");
        return router.push('/dashboard');
      } else {
        setJudulTarget(data.judul);
        setOutline(data.outline);
        setIsLoading(false);
      }
    };
    fetchDokumen();
  }, [idSkripsi, router]);

  const handleAIClick = async (action: 'paraphrase' | 'expand' | 'formalize') => {
    if (!activeSub || hargaKoin === null) return;
    
    if (Number(koin) < Number(hargaKoin)) {
      alert(`Koin tidak cukup! Butuh ${hargaKoin} Koin.`);
      return router.push('/dashboard?menu=topup');
    }

    setIsProcessingAI(true);
    setCopilotResult('');
    
    try {
      const { error } = await supabase.from('users_data').update({ koin: Number(koin) - Number(hargaKoin) }).eq('id', userId);
      if (error) throw error;
      setKoin(prev => Number(prev) - Number(hargaKoin));

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: activeSub.deskripsi, action: action, judulSkripsi: judulTarget, namaBab: activeSub.judul })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setCopilotResult(data.result);

      await supabase.from('ai_tools_history').insert({
        user_id: userId,
        tool_name: 'AI Draft Writer',
        input_data: activeSub.deskripsi.substring(0, 100) + '...',
        result_data: { teks_hasil: data.result }
      });

    } catch (err: any) {
      alert(err.message || "Gagal menghubungi AI Copilot.");
      await supabase.from('users_data').update({ koin: koin }).eq('id', userId);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleCopy = () => {
    let textToCopy = `JUDUL SKRIPSI:\n${judulTarget}\n\n`;
    outline.forEach(item => {
      textToCopy += `${item.bab}\n`;
      item.subBab?.forEach(sub => {
        textToCopy += `\n${sub.judul}\n${sub.deskripsi}\n`;
        if (sub.url_asli) textToCopy += `Link: ${sub.url_asli}\n`;
      });
      textToCopy += `\n----------------------------------------\n\n`;
    });
    navigator.clipboard.writeText(textToCopy);
    alert('Dokumen berhasil disalin!');
  };

  const handleDownloadWord = () => {
    let htmlContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${judulTarget}</title></head><body><h1>${judulTarget}</h1>`;
    outline.forEach(item => {
      htmlContent += `<h2>${item.bab}</h2>`;
      item.subBab?.forEach(sub => {
        htmlContent += `<h3>${sub.judul}</h3><p>${sub.deskripsi}</p>`;
        if (sub.url_asli) htmlContent += `<p class="link"><a href="${sub.url_asli}">${sub.url_asli}</a></p>`;
      });
    });
    htmlContent += `</body></html>`;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Skripsi_${judulTarget.replace(/[^a-z0-9]/gi, '_').substring(0, 30)}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div></div>;

  const iconParafrase = <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>;
  const iconExpand = <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>;
  const iconFormalize = <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.83M11.42 15.17l-.496.496c-.452.453-1.127.57-1.748.29L6.5 14.75 4.5 16.75A1.5 1.5 0 012.38 14.63l2-2-1.21-2.67c-.28-.621-.162-1.296.29-1.748l.496-.496m7.464 7.464l-7.464-7.464m14.928 0v-3.75M21 7.5c0-1.154-.741-2.146-1.782-2.438a22.091 22.091 0 00-6.438-1.062 22.092 22.092 0 00-6.438 1.062C5.305 5.354 4.5 6.296 4.5 7.5v3.75" /></svg>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 print:bg-white print:pb-0">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/dashboard" className="text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-2">Kembali</Link>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="text-sm font-bold bg-slate-100 px-4 py-2.5 rounded-xl hover:bg-slate-200">Copy</button>
            <button onClick={handleDownloadWord} className="text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm">Export Word</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-10 print:pt-0 print:px-0">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl p-8 sm:p-14 print:border-none print:shadow-none print:p-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center uppercase mb-10">{judulTarget}</h1>
          <div className="space-y-12">
            {outline.map((item, index) => (
              <div key={index} className="space-y-6">
                <h2 className="text-2xl font-extrabold border-b-2 pb-2 inline-block text-blue-800 border-blue-100">{item.bab.replace('📚', '').trim()}</h2>
                <div className="space-y-4">
                  {item.subBab?.map((sub, subIdx) => (
                    <div key={subIdx} className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-100 hover:border-blue-200">
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{sub.judul}</h3>
                      <p className="text-slate-600 text-justify text-sm mb-4">{sub.deskripsi}</p>
                      <button onClick={() => { setActiveSub(sub); setIsCopilotOpen(true); setCopilotResult(''); }} className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-100 print:hidden">
                        ✨ AI Copilot
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL AI COPILOT */}
      {isCopilotOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-xl font-black text-slate-900">AI Copilot</h4>
              <button onClick={() => setIsCopilotOpen(false)} className="h-10 w-10 text-slate-400 hover:text-slate-900">✕</button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'paraphrase', label: 'Parafrase', icon: iconParafrase },
                  { id: 'expand', label: 'Kembangkan', icon: iconExpand },
                  { id: 'formalize', label: 'Formalize', icon: iconFormalize },
                ].map((opt) => (
                  <button key={opt.id} onClick={() => handleAIClick(opt.id as any)} disabled={isProcessingAI} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm disabled:opacity-50">
                    <span className="text-slate-500">{opt.icon}</span><span className="text-[10px] font-black uppercase text-slate-600">{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Hasil Penulisan AI</label>
                <div className="min-h-[200px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 relative">
                  {isProcessingAI ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 mb-2"></div><p className="text-[10px] font-bold uppercase animate-pulse">Menulis...</p></div>
                  ) : copilotResult ? (
                    <div><p className="text-slate-800 text-sm">{copilotResult}</p><button onClick={() => navigator.clipboard.writeText(copilotResult)} className="mt-4 w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold">Salin Hasil</button></div>
                  ) : <p className="text-slate-400 text-xs italic text-center">Pilih tindakan di atas.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DokumenSkripsiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50"></div>}>
      <DokumenContent />
    </Suspense>
  );
}