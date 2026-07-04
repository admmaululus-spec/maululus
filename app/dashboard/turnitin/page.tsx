'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

export default function TurnitinCheckPage() {
  const router = useRouter();
  const HARGA_KOIN = 20;

  const [userId, setUserId] = useState<string | null>(null);
  const [koin, setKoin] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ score: number, matches: string[] } | null>(null);

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

  const handleScan = async () => {
    if (textInput.length < 50) return alert("Minimal masukkan 50 karakter untuk di-scan.");
    if (koin < HARGA_KOIN) {
      alert(`Koin tidak cukup! Layanan ini membutuhkan ${HARGA_KOIN} Koin.`);
      return router.push('/dashboard/upgrade');
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      // 1. Potong Koin
      const { error } = await supabase.from('users_data').update({ koin: koin - HARGA_KOIN }).eq('id', userId);
      if (error) throw error;
      setKoin(prev => prev - HARGA_KOIN);

      // 2. TODO: Panggil API Copyleaks lewat backend
      // Simulasi delay scanning (karena cek plagiasi butuh waktu sekitar 5 detik)
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Dummy Response (Nanti diganti response asli Copyleaks)
      setScanResult({
        score: 24, // 24% Plagiasi
        matches: [
          "https://id.wikipedia.org/wiki/Sistem_Informasi",
          "https://jurnal.ugm.ac.id/teknologi-informasi",
          "https://eprints.undip.ac.id/skripsi_mahasiswa"
        ]
      });

    } catch (err) {
      alert("Sistem sedang sibuk. Koin dikembalikan.");
      await supabase.from('users_data').update({ koin: koin }).eq('id', userId);
      setKoin(koin);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-semibold text-sm transition-colors">
            <span>&larr;</span> Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
            <span className="text-amber-500">🪙</span>
            <span className="text-sm font-bold text-slate-800">{koin} Koin</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-start gap-5">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl text-2xl shrink-0">🛡️</div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cek Plagiasi (Turnitin Standard)</h1>
              <p className="text-slate-500 mt-2 text-sm max-w-xl">Pindai dokumenmu untuk mendeteksi kesamaan teks dengan miliaran halaman web dan jurnal menggunakan teknologi Copyleaks.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Area Input (Kiri - Lebar 2 Kolom) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-700">Teks Dokumen</h3>
              <div className="text-[10px] bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold border border-amber-200 flex items-center gap-1">
                ⚠️ Biaya Scan: {HARGA_KOIN} Koin
              </div>
            </div>
            
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Tempelkan isi Bab skripsi atau tulisanmu di sini untuk dipindai..."
              className="flex-1 min-h-[400px] w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm resize-none outline-none focus:border-rose-500 transition-all leading-relaxed"
            ></textarea>
            
            <button 
              onClick={handleScan}
              disabled={isScanning || textInput.length < 50}
              className="w-full mt-5 bg-rose-600 text-white font-bold py-4 rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50 text-sm shadow-md shadow-rose-600/20"
            >
              {isScanning ? 'Memproses Pemindaian Global...' : 'Scan Dokumen Sekarang'}
            </button>
          </div>

          {/* Area Hasil (Kanan - Lebar 1 Kolom) */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
            <h3 className="font-bold text-sm text-slate-800 mb-6 border-b border-slate-200 pb-4">Hasil Plagiasi</h3>
            
            {isScanning ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm font-bold text-rose-600 mt-6 animate-pulse">Scanning di Database...</p>
                <p className="text-[10px] text-slate-400 mt-2 text-center max-w-[200px]">Proses ini membutuhkan waktu hingga 15-30 detik.</p>
              </div>
            ) : scanResult ? (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col items-center justify-center mb-8">
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center border-8 shadow-sm ${
                    scanResult.score <= 15 ? 'border-green-500 text-green-600 bg-green-50' : 
                    scanResult.score <= 30 ? 'border-amber-400 text-amber-600 bg-amber-50' : 
                    'border-red-500 text-red-600 bg-red-50'
                  }`}>
                    <span className="text-4xl font-black">{scanResult.score}%</span>
                  </div>
                  <p className="text-sm font-bold mt-4 text-slate-700">Indeks Kemiripan (Similarity)</p>
                </div>
                
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Sumber Ditemukan:</h4>
                <div className="space-y-2">
                  {scanResult.matches.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noreferrer" className="block p-3 bg-white border border-slate-200 rounded-xl text-xs text-blue-600 truncate hover:bg-slate-100 hover:border-blue-200 transition-colors">
                      🔗 {url.replace('https://', '')}
                    </a>
                  ))}
                  {scanResult.matches.length === 0 && (
                    <div className="p-3 bg-green-50 text-green-700 rounded-xl text-xs font-bold text-center">
                      Dokumen 100% Original! 🎉
                    </div>
                  )}
                </div>
              </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center opacity-50 pt-10">
                 <span className="text-5xl mb-4 grayscale">📄</span>
                 <p className="text-xs font-medium text-slate-500 text-center px-4">Laporan plagiasi dan sumber yang cocok akan tampil di sini.</p>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}