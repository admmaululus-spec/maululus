// app/dashboard/turnitin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import { SimilarityResponse } from '@/app/lib/similarity/types';

export default function TurnitinCheckPage() {
  const router = useRouter();

  const [hargaKoin, setHargaKoin] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [koin, setKoin] = useState(0);
  
  const [textInput, setTextInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<SimilarityResponse | null>(null);

  useEffect(() => {
    const initializePage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/auth');
      setUserId(session.user.id);

      const { data: userData } = await supabase.from('users_data').select('koin').eq('id', session.user.id).single();
      if (userData) setKoin(userData.koin);

      const { data: priceData } = await supabase.from('ai_tools_pricing').select('koin').eq('id', 'turnitin').single();
      setHargaKoin(priceData ? priceData.koin : 20);
    };
    initializePage();
  }, [router]);

  const handleScanClick = async () => {
    if (textInput.length < 50) return alert("Minimal masukkan 50 karakter untuk di-scan.");
    if (hargaKoin === null) return;
    
    if (Number(koin) < Number(hargaKoin)) {
      alert(`Koin Anda tidak cukup! Layanan ini membutuhkan ${hargaKoin} Koin.`);
      return router.push('/dashboard?menu=topup');
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const { error } = await supabase.from('users_data').update({ koin: Number(koin) - Number(hargaKoin) }).eq('id', userId);
      if (error) throw error;
      setKoin(prev => Number(prev) - Number(hargaKoin));

      const res = await fetch('/api/turnitin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menghubungi server plagiasi");
      }
      
      const data = await res.json();
      setScanResult(data.result);

    } catch (err: any) {
      console.error(err);
      alert(`Gagal memproses dokumen: ${err.message}. Koin dikembalikan.`);
      if (userId) {
        await supabase.from('users_data').update({ koin: koin }).eq('id', userId);
        setKoin(koin);
      }
    } finally {
      setIsScanning(false);
    }
  };

  // 👈 PERBAIKAN: Fungsi untuk membawa teks ke halaman Parafrase
  const handlePerbaikiAI = () => {
    if (!textInput) return;
    // Simpan draft teks ke memori lokal browser
    localStorage.setItem('maululus_draft_parafrase', textInput);
    // Pindah ke halaman Parafrase
    router.push('/dashboard/parafrase');
  };

  const getScoreColor = (score: number) => {
    if (score <= 15) return 'text-emerald-600 border-emerald-500 bg-emerald-50';
    if (score <= 30) return 'text-yellow-600 border-yellow-400 bg-yellow-50';
    return 'text-rose-600 border-rose-500 bg-rose-50';
  };

  const getSentenceColor = (sim: number) => {
    if (sim > 80) return 'bg-rose-200/60 text-rose-900 border-b border-rose-300';
    if (sim >= 50) return 'bg-orange-200/60 text-orange-900 border-b border-orange-300';
    if (sim >= 20) return 'bg-yellow-100 text-yellow-800 border-b border-yellow-200';
    return 'bg-transparent text-slate-700'; 
  };

  if (hargaKoin === null) return <div className="h-[100dvh] bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="h-[100dvh] overflow-y-auto bg-slate-50 font-sans text-slate-800 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-semibold text-sm transition-colors">
            <span>&larr;</span> Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
            <span className="text-amber-500">🪙</span>
            <span className="text-sm font-bold text-slate-800">{koin} Koin</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-start gap-5">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl text-2xl shrink-0">🛡️</div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Academic Similarity Checker</h1>
            <p className="text-slate-500 mt-2 text-sm max-w-xl">Pindai dokumen Anda dengan database akademik global dan analisis AI mendalam.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-fit sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-700">Teks Dokumen</h3>
              <div className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold border border-amber-200 flex items-center gap-1">⚠️ Biaya Scan: {hargaKoin} Koin</div>
            </div>
            
            <textarea
              value={textInput} onChange={(e) => setTextInput(e.target.value)}
              placeholder="Tempelkan isi Bab skripsi..."
              className="flex-1 min-h-[400px] w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm resize-none outline-none focus:border-rose-500 transition-all leading-relaxed"
            ></textarea>
            
            <button 
              onClick={handleScanClick} disabled={isScanning || textInput.length < 50}
              className="w-full mt-5 bg-rose-600 text-white font-bold py-4 rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50 text-sm shadow-md shadow-rose-600/20"
            >
              {isScanning ? 'Menganalisis Dokumen...' : `Mulai Pindai AI (-${hargaKoin} Koin)`}
            </button>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
            <h3 className="font-bold text-lg text-slate-800 mb-6 border-b border-slate-200 pb-4">Laporan Similarity & AI Analysis</h3>
            
            {isScanning ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="relative w-20 h-20"><div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div><div className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"></div></div>
                <p className="text-sm font-bold text-rose-600 mt-6 animate-pulse">AI Engine sedang memindai ratusan jurnal...</p>
              </div>
            ) : scanResult ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 shadow-sm">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center border-8 shadow-inner mb-3 ${getScoreColor(scanResult.overallSimilarity)}`}>
                      <span className="text-3xl font-black">{scanResult.overallSimilarity}%</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Similarity</span>
                  </div>
                  
                  <div className="col-span-2 flex flex-col justify-between gap-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block mb-1">Status Dokumen</span>
                        <span className="font-extrabold text-slate-800 flex items-center gap-2">
                          {scanResult.riskLevel === 'Sangat Aman' && '🟢 Sangat Aman'}
                          {scanResult.riskLevel === 'Risiko Rendah' && '🟡 Risiko Rendah'}
                          {scanResult.riskLevel === 'Risiko Sedang' && '🟠 Risiko Sedang'}
                          {scanResult.riskLevel === 'Risiko Tinggi' && '🔴 Risiko Tinggi'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 block mb-1">AI Confidence</span>
                        <span className="font-extrabold text-indigo-600 text-lg">{scanResult.confidence}%</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 bg-rose-50 border border-rose-100 rounded-xl p-3 text-center"><span className="block text-[10px] text-rose-500 font-bold uppercase mb-1">High</span><span className="text-rose-700 font-bold text-lg">{scanResult.breakdown.high}%</span></div>
                      <div className="flex-1 bg-orange-50 border border-orange-100 rounded-xl p-3 text-center"><span className="block text-[10px] text-orange-500 font-bold uppercase mb-1">Medium</span><span className="text-orange-700 font-bold text-lg">{scanResult.breakdown.medium}%</span></div>
                      <div className="flex-1 bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-center"><span className="block text-[10px] text-yellow-600 font-bold uppercase mb-1">Low</span><span className="text-yellow-700 font-bold text-lg">{scanResult.breakdown.low}%</span></div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <h4 className="text-sm font-black text-indigo-900 mb-3 flex items-center gap-2">✨ Analisis AI</h4>
                  <p className="text-sm text-indigo-800/80 leading-relaxed mb-5">{scanResult.analysis}</p>
                  
                  <h5 className="text-xs font-bold text-indigo-900 mb-2 uppercase tracking-wide">Rekomendasi Perbaikan:</h5>
                  <ul className="space-y-2 mb-6">
                    {scanResult.recommendation.map((rec, i) => (
                      <li key={i} className="text-sm text-indigo-800 flex items-start gap-2">
                        <span className="text-indigo-500 mt-0.5">✔</span> {rec}
                      </li>
                    ))}
                  </ul>

                  {/* 👈 PERBAIKAN: Tombol untuk melompat ke Tool Parafrase */}
                  <button 
                    onClick={handlePerbaikiAI}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all flex items-center gap-2 shadow-md shadow-indigo-200 active:scale-95"
                  >
                    <span>✨</span> Perbaiki dengan AI Parafrase
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-4">Tinjauan Teks (Highlight)</h4>
                  <div className="space-y-6">
                    {scanResult.paragraphs.map((para) => {
                       const pSentences = scanResult.sentences.filter(s => para.text.includes(s.text));
                       
                       return (
                        <div key={para.id} className="relative group">
                          <div className="absolute -left-3 top-0 h-full w-1 bg-slate-200 rounded-full group-hover:bg-indigo-400 transition-colors"></div>
                          <div className="flex justify-between items-center mb-2 pl-2">
                            <span className="text-xs font-bold text-slate-400">Paragraf {para.id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${para.similarity > 50 ? 'bg-rose-100 text-rose-700 border-rose-200' : para.similarity > 20 ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                              Sim: {para.similarity}%
                            </span>
                          </div>
                          <p className="text-sm leading-loose pl-2 text-justify">
                            {pSentences.length > 0 ? (
                              pSentences.map((sent, i) => (
                                <span key={i} className={`px-1 py-0.5 rounded transition-all duration-300 hover:shadow-md cursor-help ${getSentenceColor(sent.similarity)}`} title={`Mirip ${sent.similarity}% dengan: ${sent.paper}`}>
                                  {sent.text}{" "}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-600">{para.text}</span>
                            )}
                          </p>
                        </div>
                       );
                    })}
                  </div>
                  <div className="mt-4 flex gap-4 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-3 h-3 bg-rose-200 border border-rose-300 rounded"></span> &gt;80%</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-3 h-3 bg-orange-200 border border-orange-300 rounded"></span> 50-80%</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><span className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></span> 20-50%</div>
                  </div>
                </div>

                {scanResult.papers.length > 0 && (
                  <div className="border-t border-slate-200 pt-8">
                    <h4 className="font-bold text-slate-800 mb-4">Referensi Akademik Ditemukan</h4>
                    <div className="space-y-4">
                      {scanResult.papers.map((paper, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 transition-colors">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h5 className="font-bold text-blue-700 text-sm leading-snug mb-1">{paper.title}</h5>
                              <p className="text-xs text-emerald-700 font-semibold">{paper.authors} ({paper.year})</p>
                              <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">{paper.publisher} {paper.doi !== '-' && `• DOI: ${paper.doi}`}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className="bg-white border border-slate-200 text-xs font-black text-slate-700 px-3 py-1 rounded-lg">Sim: {paper.similarity}%</span>
                              {paper.url !== '#' && (
                                <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-indigo-600 hover:underline">Buka Link ↗</a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center opacity-50 pt-20 pb-20">
                 <span className="text-6xl mb-4 grayscale opacity-40">📊</span>
                 <p className="text-sm font-medium text-slate-500">Laporan AI Similarity akan tampil di sini.</p>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}