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

  // States untuk AI Copilot
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [activeSub, setActiveSub] = useState<{judul: string, deskripsi: string} | null>(null);
  const [copilotResult, setCopilotResult] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  useEffect(() => {
    if (!idSkripsi) {
      router.push('/dashboard');
      return;
    }

    const fetchDokumen = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('history_skripsi')
        .select('*')
        .eq('id', idSkripsi)
        .eq('user_id', session.user.id) 
        .single();

      if (error || !data) {
        alert("Dokumen tidak ditemukan.");
        router.push('/dashboard');
      } else if (!data.is_unlocked) {
        alert("Dokumen ini masih terkunci.");
        router.push('/dashboard');
      } else {
        setJudulTarget(data.judul);
        setOutline(data.outline);
        setIsLoading(false);
      }
    };

    fetchDokumen();
  }, [idSkripsi, router]);

  const handleAICall = async (action: 'paraphrase' | 'expand' | 'formalize') => {
    if (!activeSub) return;
    setIsProcessingAI(true);
    setCopilotResult('');
    
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: activeSub.deskripsi,
          action,
          judulSkripsi: judulTarget,
          namaBab: activeSub.judul
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCopilotResult(data.result);
    } catch (err: any) {
      alert(err.message || "Gagal menghubungi AI Copilot.");
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
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${judulTarget}</title>
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.5; }
          h1 { text-align: center; text-transform: uppercase; font-size: 16pt; margin-bottom: 24pt; }
          h2 { text-transform: uppercase; font-size: 14pt; margin-top: 24pt; color: #000; }
          h3 { font-size: 12pt; margin-top: 12pt; color: #000; }
          p { text-align: justify; font-size: 12pt; margin-bottom: 12pt; }
          .link { font-size: 10pt; color: blue; text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>${judulTarget}</h1>
    `;

    outline.forEach(item => {
      htmlContent += `<h2>${item.bab}</h2>`;
      item.subBab?.forEach(sub => {
        htmlContent += `<h3>${sub.judul}</h3>`;
        htmlContent += `<p>${sub.deskripsi}</p>`;
        if (sub.url_asli) {
          htmlContent += `<p class="link"><a href="${sub.url_asli}">${sub.url_asli}</a></p>`;
        }
      });
    });

    htmlContent += `
        <br><hr>
        <p style="text-align: center; font-size: 10pt; color: #666;">Di-generate secara otomatis oleh Maululus AI</p>
      </body></html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeJudul = judulTarget.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
    link.download = `Skripsi_${safeJudul}.doc`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div></div>;

  // Ikon-ikon profesional pengganti Emoji
  const iconParafrase = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>;
  const iconExpand = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>;
  const iconFormalize = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.83M11.42 15.17l-.496.496c-.452.453-1.127.57-1.748.29L6.5 14.75 4.5 16.75A1.5 1.5 0 012.38 14.63l2-2-1.21-2.67c-.28-.621-.162-1.296.29-1.748l.496-.496m7.464 7.464l-7.464-7.464m14.928 0v-3.75M21 7.5c0-1.154-.741-2.146-1.782-2.438a22.091 22.091 0 00-6.438-1.062 22.092 22.092 0 00-6.438 1.062C5.305 5.354 4.5 6.296 4.5 7.5v3.75" /></svg>;
  const iconSparkles = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 print:bg-white print:pb-0">
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto px-6 h-auto py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/dashboard" className="text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-2 self-start sm:self-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m15 18-6-6 6-6"/></svg>
            Kembali
          </Link>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button onClick={handleCopy} className="flex-1 sm:flex-none justify-center text-sm font-bold bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy
            </button>
            <button onClick={handleDownloadPDF} className="flex-1 sm:flex-none justify-center text-sm font-bold bg-red-50 text-red-700 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 18v-6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v6"/><path d="M10 14h4"/></svg>
              PDF
            </button>
            <button onClick={handleDownloadWord} className="flex-1 sm:flex-none justify-center text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
              Export Word
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-10 print:pt-0 print:px-0">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-8 sm:p-14 print:border-none print:shadow-none print:rounded-none print:p-0">
          
          <div className="text-center border-b-2 border-slate-100 pb-8 mb-10 print:border-b-0 print:pb-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 mb-6 border border-green-100 print:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
              Dokumen Resmi Maululus
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug max-w-2xl mx-auto uppercase print:text-2xl">
              {judulTarget}
            </h1>
          </div>

          <div className="space-y-12 print:space-y-6">
            {outline.map((item, index) => (
              <div key={index} className="space-y-6 print:space-y-4">
                <h2 className={`text-2xl font-extrabold border-b-2 pb-2 inline-block print:text-black print:border-b-0 print:border-black print:pb-1 ${item.bab.includes('REFERENSI') || item.bab.includes('📚') ? 'text-amber-600 border-amber-200' : 'text-blue-800 border-blue-100'}`}>
                  {item.bab.replace('📚', '').trim()} {/* Menghapus emoji buku di judul utama */}
                </h2>
                
                <div className="space-y-4 print:space-y-2">
                  {item.subBab?.map((sub, subIdx) => (
                    <div key={subIdx} className="group bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-100 hover:border-blue-200 transition-all print:bg-transparent print:border-none print:p-0">
                      <h3 className="text-lg font-bold text-slate-800 mb-2 print:text-black">{sub.judul}</h3>
                      <p className="text-slate-600 leading-relaxed text-justify text-sm sm:text-base print:text-black mb-4">
                        {sub.deskripsi}
                      </p>

                      <div className="flex flex-wrap gap-2 print:hidden">
                        {/* TOMBOL AI COPILOT YANG SUDAH BERSIH DARI EMOJI */}
                        <button 
                          onClick={() => { setActiveSub(sub); setIsCopilotOpen(true); setCopilotResult(''); }}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all"
                        >
                          {iconSparkles}
                          AI Copilot
                        </button>

                        {/* TOMBOL JURNAL ASLI / GOOGLE SCHOLAR */}
                        {sub.url_asli ? (
                          <a 
                            href={sub.url_asli} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100 border border-emerald-100 px-3 py-1.5 rounded-lg transition-all w-fit print:hidden"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                            Buka Jurnal Asli
                          </a>
                        ) : (
                          <a 
                            href={`https://scholar.google.com/scholar?q=${encodeURIComponent(judulTarget + ' ' + sub.judul)}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-all w-fit print:hidden"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            Cari Referensi di Google Scholar
                          </a>
                        )}
                      </div>
                      
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm font-medium print:mt-10 print:pt-4">
            Dokumen ini di-*generate* secara otomatis oleh Maululus AI. <br className="print:hidden"/>
            Selalu konsultasikan kembali dengan Dosen Pembimbing Anda.
          </div>
        </div>
      </main>

      {/* ================= MODAL AI COPILOT ================= */}
      {isCopilotOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  {/* Ikon Sparkles menggantikan emoji ✨ di header */}
                  <span className="text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>
                  </span>
                  AI Copilot
                </h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{activeSub?.judul}</p>
              </div>
              <button onClick={() => setIsCopilotOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white transition-colors text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
              {/* OPSI TINDAKAN TANPA EMOJI */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'paraphrase', label: 'Parafrase', icon: iconParafrase, color: 'blue' },
                  { id: 'expand', label: 'Kembangkan', icon: iconExpand, color: 'indigo' },
                  { id: 'formalize', label: 'Formalize', icon: iconFormalize, color: 'emerald' },
                ].map((opt) => (
                  <button 
                    key={opt.id}
                    onClick={() => handleAICall(opt.id as any)}
                    disabled={isProcessingAI}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200 hover:border-${opt.color}-400 hover:bg-${opt.color}-50 transition-all group disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-slate-200 bg-white shadow-sm`}
                  >
                    <span className={`text-slate-500 group-hover:text-${opt.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                      {opt.icon}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* HASIL GENERATE */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Hasil Penulisan AI</label>
                <div className="min-h-[200px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6 relative">
                  {isProcessingAI ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase animate-pulse">Sedang Berpikir...</p>
                    </div>
                  ) : copilotResult ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{copilotResult}</p>
                      <button 
                        onClick={() => { navigator.clipboard.writeText(copilotResult); alert("Tersalin ke clipboard!"); }}
                        className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex justify-center items-center gap-2 active:scale-95"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>
                        Salin Hasil Tulisan
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-400 text-xs italic text-center px-4">Pilih salah satu tindakan di atas untuk mulai menulis secara otomatis berdasarkan konteks sub-bab ini.</p>
                    </div>
                  )}
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