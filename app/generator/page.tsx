'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Definisi tipe data hasil dari AI
type JudulItem = {
  judul: string;
  alasan: string;
  novelty_check: string;
};

// Daftar kalimat untuk setiap langkah loading
const LOADING_STEPS = [
  "Menganalisis parameter kampus dan program studi...",     // Step 0 (0 Detik)
  "Mengevaluasi tren penelitian terbaru...",                // Step 1 (Mulai Detik 1.5)
  "Mengonstruksi rumusan masalah dan variabel...",          // Step 2 (Mulai Detik 3.0) -> API CALL DIMULAI DI SINI
  "Menyesuaikan pendekatan metodologi...",                  // Step 3 (Mulai Detik 4.5)
  "Menyempurnakan tata bahasa dan finalisasi judul..."      // Step 4 (Mulai Detik 6.0 - Menunggu API Selesai)
];

export default function GeneratorPage() {
  const router = useRouter();
  
  // States Form Utama
  const [universitas, setUniversitas] = useState('');
  const [jenisKarya, setJenisKarya] = useState('S1 - Skripsi');
  const [jurusan, setJurusan] = useState('');
  const [minat, setMinat] = useState('');
  
  // States Metodologi & Masalah
  const [metodologi, setMetodologi] = useState('Bebas (AI yang tentukan)');
  const [customMetodologi, setCustomMetodologi] = useState('');
  const [masalah, setMasalah] = useState('');
  
  // States Loading & Hasil
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [hasilJudul, setHasilJudul] = useState<JudulItem[]>([]);
  const [aiKoreksi, setAiKoreksi] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Opsi Dropdown
  const daftarJenisKarya = ['S1 - Skripsi', 'S2 - Tesis', 'S3 - Disertasi', 'Artikel Jurnal Ilmiah'];
  const daftarMetodologi = [
    'Bebas (AI yang tentukan)', 'Kuantitatif', 'Kualitatif', 
    'Mixed Methods (Campuran)', 'Research & Development (R&D)', 
    'Studi Kasus', 'Eksperimen', 'Lainnya (Ketik Sendiri...)'
  ];

  // Fungsi utilitas untuk jeda (delay) waktu
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleGenerateJudul = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!universitas || !jurusan) {
      alert("Nama Universitas dan Program Studi wajib diisi!");
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);
    setErrorMsg('');
    setAiKoreksi('');
    setHasilJudul([]);

    const metodologiFinal = metodologi === 'Lainnya (Ketik Sendiri...)' ? customMetodologi : metodologi;

    try {
      // -------------------------------------------------------------
      // SIMULASI STEP 0 & 1 (Hanya UI, Tidak membebani server)
      // -------------------------------------------------------------
      await delay(1500); 
      setLoadingStep(1); 
      
      await delay(1500); 
      setLoadingStep(2);

      // -------------------------------------------------------------
      // STEP 2: DI SINI KITA BARU BENAR-BENAR MENGIRIM REQUEST KE API
      // -------------------------------------------------------------
      const apiPromise = fetch('/api/generate-judul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universitas, jurusan, minat, masalah, metodologi: metodologiFinal, jenisKarya }),
      });

      // Lanjutkan animasi UI sementara API sedang berjalan di latar belakang
      await delay(1500);
      setLoadingStep(3);

      await delay(1500);
      setLoadingStep(4);

      // -------------------------------------------------------------
      // TUNGGU RESPONSE API SELESAI
      // -------------------------------------------------------------
      const response = await apiPromise;
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan pada server');
      
      if (data.status === 'invalid') {
        setAiKoreksi(data.pesan);
      } else {
        setHasilJudul(data.data || []);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Gagal menghubungi server AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanjutkan = (judulDipilih: string) => {
    // Simpan data ke local storage untuk digunakan di halaman outline
    localStorage.setItem('form_universitas', universitas);
    localStorage.setItem('form_jurusan', jurusan);

    // LOGIKA BARU: Bersihkan jenis karya (misal "S1 - Skripsi" menjadi "Skripsi")
    let jenisClean = jenisKarya;
    if (jenisKarya.includes('-')) {
      jenisClean = jenisKarya.split('-')[1].trim();
    }

    // Lempar parameter judul DAN jenis ke halaman outline
    router.push(`/generator/outline?judul=${encodeURIComponent(judulDipilih)}&jenis=${encodeURIComponent(jenisClean)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
          <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors tracking-tighter uppercase">← Kembali ke Dashboard</Link>
          <div className="text-sm font-bold tracking-tight text-slate-900 uppercase">Maululus AI</div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-10 px-6 pt-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/50 px-4 py-1.5 text-sm font-semibold text-blue-700 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            Sistem Pencarian Cerdas
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Cari Judul Anti-Pasaran</h1>
          <p className="text-slate-500 text-sm sm:text-base">Sesuaikan kampus, tingkat studi, dan masalah yang ingin diteliti.</p>
        </div>

        {/* Form Card dengan Overlay */}
        <form onSubmit={handleGenerateJudul} className="relative overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white p-8 sm:p-10 shadow-sm">
          
          {/* ======================================================== */}
          {/* INTERACTIVE LOADING OVERLAY (TEMA PROFESIONAL)           */}
          {/* ======================================================== */}
          {isLoading && (
            <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
              <div className="w-full max-w-sm px-6 flex flex-col items-center">
                
                {/* Animasi Custom: Cincin Ganda Profesional */}
                <div className="relative flex items-center justify-center w-20 h-20 mb-8">
                  {/* Cincin Luar (Spin Normal) */}
                  <div className="absolute inset-0 border-[3px] border-slate-100 rounded-full"></div>
                  <div className="absolute inset-0 border-[3px] border-slate-900 border-t-transparent border-r-transparent rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                  
                  {/* Cincin Dalam (Spin Berlawanan Arah & Lebih Cepat) */}
                  <div className="absolute inset-2 border-[3px] border-blue-500/20 rounded-full"></div>
                  <div className="absolute inset-2 border-[3px] border-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
                  
                  {/* Inti (Core) Pulsing */}
                  <div className="w-3 h-3 bg-slate-900 rounded-full animate-ping"></div>
                  <div className="absolute w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                </div>
                
                {/* Teks Animasi Berganti */}
                <div className="h-12 flex items-center justify-center overflow-hidden w-full relative">
                  <h3 
                    key={loadingStep} 
                    className="absolute text-sm font-bold text-slate-800 text-center animate-in slide-in-from-bottom-4 fade-in duration-500"
                  >
                    {LOADING_STEPS[loadingStep]}
                  </h3>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden shadow-inner">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-slate-900 to-blue-500 relative"
                    style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[9px] text-slate-400 font-bold tracking-widest mt-4 uppercase">
                  Tahap {loadingStep + 1} dari {LOADING_STEPS.length}
                </p>
              </div>
            </div>
          )}

          {/* Isi Formulir */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Universitas <span className="text-blue-600">*</span></label>
              <input type="text" placeholder="cth: Universitas Brawijaya" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" value={universitas} onChange={(e) => setUniversitas(e.target.value)} required />
            </div>
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Program Studi <span className="text-blue-600">*</span></label>
              <input type="text" placeholder="cth: Sistem Informasi" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" value={jurusan} onChange={(e) => setJurusan(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Jenis Karya <span className="text-blue-600">*</span></label>
              <select className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none" value={jenisKarya} onChange={(e) => setJenisKarya(e.target.value)}>
                {daftarJenisKarya.map((item) => (<option key={item} value={item}>{item}</option>))}
              </select>
            </div>
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Topik / Minat <span className="text-slate-400 font-normal lowercase">(Opsional)</span></label>
              <input type="text" placeholder="cth: Kecerdasan Buatan..." className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" value={minat} onChange={(e) => setMinat(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Metodologi <span className="text-slate-400 font-normal lowercase">(Opsional)</span></label>
              <select className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none" value={metodologi} onChange={(e) => setMetodologi(e.target.value)}>
                {daftarMetodologi.map((metode) => (<option key={metode} value={metode}>{metode}</option>))}
              </select>
              {metodologi === 'Lainnya (Ketik Sendiri...)' && (
                <input type="text" placeholder="Spesifikasikan metode..." className="w-full mt-3 rounded-xl border border-blue-200 bg-blue-50/30 p-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white" value={customMetodologi} onChange={(e) => setCustomMetodologi(e.target.value)} required />
              )}
            </div>
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Masalah / Kasus <span className="text-slate-400 font-normal lowercase">(Opsional)</span></label>
              <textarea placeholder="Ceritakan sedikit fenomena/masalah di lapangan..." className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 resize-none h-[56px]" value={masalah} onChange={(e) => setMasalah(e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="mt-4 w-full rounded-2xl bg-slate-900 p-4 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm flex justify-center items-center gap-3">
            Mulai Generate Judul
          </button>
        </form>

        {/* NOTIFIKASI TEGURAN AI */}
        {aiKoreksi && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex flex-col sm:flex-row items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m10.2 3.2-6.5 15a1 1 0 0 0 1.3 1.3l15-6.5a1 1 0 0 0 0-1.8l-15-6.5a1 1 0 0 0-1.3 1.3z"/><path d="m14.5 9.5-5 5"/></svg>
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm mb-1">Pesan dari Maululus AI</p>
              <p className="text-amber-800 text-sm leading-relaxed">{aiKoreksi}</p>
            </div>
          </div>
        )}

        {/* Notifikasi Error Teknis */}
        {errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 flex items-start gap-3">
            <div>
              <p className="font-bold text-red-800 text-sm">Terjadi Kesalahan</p>
              <p className="mt-1 text-xs">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* HASIL JUDUL */}
        {hasilJudul.length > 0 && !aiKoreksi && (
          <div className="space-y-6 pt-4 animate-in slide-in-from-bottom-8">
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Rekomendasi Terbaik
            </h2>
            
            <div className="grid gap-6">
              {hasilJudul.map((item, index) => (
                <div key={index} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col gap-6">
                  
                  <div>
                    <div className="inline-flex items-center justify-center rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest">Opsi {index + 1}</div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">{item.judul}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Alasan Akademis
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.alasan}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Status Novelty (Kebaruan)
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.novelty_check}</p>
                    </div>
                  </div>
                  
                  <button onClick={() => handleLanjutkan(item.judul)} className="w-full md:w-auto self-start rounded-xl bg-slate-900 text-white px-6 py-3 text-sm font-bold hover:bg-slate-800 transition-all flex justify-center items-center gap-2">
                    Pilih & Lanjut ke Bab 1
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}