'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

export default function SitasiPage() {
  const router = useRouter();

  const [hargaKoin, setHargaKoin] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [koin, setKoin] = useState(0);
  
  const [inputData, setInputData] = useState('');
  const [format, setFormat] = useState('APA 7th Edition');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ in_text_citation: string, bibliography: string, style_used: string } | null>(null);

  useEffect(() => {
    const initializePage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/auth');
      setUserId(session.user.id);

      const { data: userData } = await supabase.from('users_data').select('koin').eq('id', session.user.id).single();
      if (userData) setKoin(userData.koin);

      const { data: priceData } = await supabase.from('ai_tools_pricing').select('koin').eq('id', 'sitasi').single();
      setHargaKoin(priceData ? priceData.koin : 2);
    };
    initializePage();
  }, [router]);

  const handleGenerateClick = async () => {
    if (!inputData.trim()) return alert("Tuliskan judul jurnal atau link terlebih dahulu!");
    if (hargaKoin === null) return;
    
    if (Number(koin) < Number(hargaKoin)) {
      alert(`Koin tidak cukup! Kamu butuh ${hargaKoin} Koin.`);
      return router.push('/dashboard?menu=topup');
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const { error } = await supabase.from('users_data').update({ koin: Number(koin) - Number(hargaKoin) }).eq('id', userId);
      if (error) throw error;
      setKoin(prev => Number(prev) - Number(hargaKoin));

      const res = await fetch('/api/sitasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_data: inputData, format_style: format })
      });

      if (!res.ok) throw new Error("Gagal generate sitasi dari AI");
      const data = await res.json();
      setResult(data.result);

      await supabase.from('ai_tools_history').insert({
        user_id: userId,
        tool_name: 'Generate Sitasi',
        input_data: inputData.substring(0, 100) + '...',
        result_data: data.result
      });

    } catch (err) {
      alert("Terjadi kesalahan. Mengembalikan koin otomatis.");
      await supabase.from('users_data').update({ koin: koin }).eq('id', userId);
      setKoin(koin);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Berhasil disalin ke clipboard!");
  };

  if (hargaKoin === null) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-purple-600 font-semibold text-sm transition-colors">
            <span>&larr;</span> Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
            <span className="text-amber-500">🪙</span>
            <span className="text-sm font-bold text-slate-800">{koin} Koin</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-start gap-5">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl text-2xl shrink-0">📑</div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Generate Sitasi Otomatis</h1>
            <p className="text-slate-500 mt-2 text-sm max-w-xl">Ubah judul jurnal, DOI, atau link menjadi format Daftar Pustaka dan kutipan.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Pilih Format Penulisan</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 outline-none focus:border-purple-500">
                <option value="APA 7th Edition">APA 7th Edition (Paling Umum)</option>
                <option value="Harvard">Harvard Referencing</option>
                <option value="IEEE">IEEE (Untuk Teknik/IT)</option>
                <option value="MLA 9th Edition">MLA 9th Edition</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 mb-2">Judul Referensi / Link DOI</label>
              <textarea
                value={inputData} onChange={(e) => setInputData(e.target.value)}
                placeholder="Contoh: Pengaruh Sistem Informasi Geografis..."
                className="w-full h-40 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm resize-none outline-none focus:border-purple-500"
              ></textarea>
            </div>
            <button 
              onClick={handleGenerateClick} disabled={isProcessing}
              className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Menyusun...' : `Buat Sitasi (-${hargaKoin} Koin)`}
            </button>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-3xl p-6 shadow-sm flex flex-col">
            <h3 className="font-bold text-sm text-purple-900 mb-4">Hasil Generate ({format})</h3>
            {isProcessing ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kutipan Teks (In-Text)</p>
                    <button onClick={() => handleCopy(result.in_text_citation)} className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-md font-bold text-purple-600 hover:bg-purple-100">Copy</button>
                  </div>
                  <div className="bg-white border border-purple-100 p-4 rounded-xl text-sm font-semibold text-slate-800 shadow-sm">{result.in_text_citation}</div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Daftar Pustaka</p>
                    <button onClick={() => handleCopy(result.bibliography)} className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-md font-bold text-purple-600 hover:bg-purple-100">Copy</button>
                  </div>
                  <div className="bg-white border border-purple-100 p-4 rounded-xl text-sm text-slate-800 shadow-sm">{result.bibliography}</div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60">
                <span className="text-4xl mb-2">📖</span><p className="text-sm">Hasil sitasi akan muncul di sini</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}