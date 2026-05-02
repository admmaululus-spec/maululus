'use client';

import { useState } from 'react';

export default function GeneratorPage() {
  const [jurusan, setJurusan] = useState('');
  const [minat, setMinat] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasil, setHasil] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setHasil([]);

    try {
      const response = await fetch('/api/generate-judul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jurusan, minat }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan pada server');
      }

      setHasil(data.judul || []);
    } catch (error: any) {
      console.error('Gagal generate judul:', error);
      setErrorMsg(error.message || 'Gagal menghubungi server AI. Coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="mx-auto max-w-3xl space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">Generator Judul Skripsi AI</h1>
          <p className="text-slate-600 text-lg">Masukkan program studi dan topik minatmu, biar AI yang carikan ide judulnya.</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleGenerate} className="space-y-5 rounded-3xl border border-white bg-white p-8 shadow-xl shadow-blue-900/5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Program Studi</label>
            <input 
              type="text" 
              placeholder="Contoh: Sistem Informasi" 
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              value={jurusan}
              onChange={(e) => setJurusan(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Topik / Minat (Opsional)</label>
            <input 
              type="text" 
              placeholder="Contoh: Machine Learning, E-Commerce, IoT" 
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              value={minat}
              onChange={(e) => setMinat(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 w-full rounded-2xl bg-blue-600 p-4 text-white text-lg font-bold tracking-wide hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 transition-all shadow-lg shadow-blue-600/25"
          >
            {isLoading ? 'AI Sedang Berpikir...' : 'Generate Judul Sekarang'}
          </button>
        </form>

        {/* Notifikasi Error */}
        {errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <p className="font-bold flex items-center gap-2 text-lg">
              <span>⚠️</span> Oops! Terjadi Kesalahan
            </p>
            <p className="mt-1 text-red-600">{errorMsg}</p>
          </div>
        )}

        {/* Area Hasil */}
        {hasil.length > 0 && !errorMsg && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-slate-800 px-2">Rekomendasi Judul:</h2>
            <div className="grid gap-4">
              {hasil.map((judul, index) => (
                <div key={index} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300 hover:-translate-y-1">
                  {/* Efek garis biru di sebelah kiri saat di-hover */}
                  <div className="absolute left-0 top-0 h-full w-2 bg-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <p className="text-slate-700 font-medium leading-relaxed sm:text-lg">{judul}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}