'use client';

import { useState } from 'react';

export default function GeneratorPage() {
  const [jurusan, setJurusan] = useState('');
  const [minat, setMinat] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasil, setHasil] = useState<string[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Nanti kita hubungkan ini ke API Route AI kita
      const response = await fetch('/api/generate-judul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jurusan, minat }),
      });

      const data = await response.json();
      setHasil(data.judul || []);
    } catch (error) {
      console.error('Gagal generate judul:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Generator Judul Skripsi AI</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Masukkan program studi dan topik minatmu, biar AI yang carikan ide judulnya.</p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Program Studi</label>
            <input 
              type="text" 
              placeholder="Contoh: Teknik Informatika" 
              className="w-full rounded-md border border-zinc-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              value={jurusan}
              onChange={(e) => setJurusan(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Topik / Minat (Opsional)</label>
            <input 
              type="text" 
              placeholder="Contoh: Machine Learning, Sistem Pakar, Web" 
              className="w-full rounded-md border border-zinc-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              value={minat}
              onChange={(e) => setMinat(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 p-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'AI Sedang Berpikir...' : 'Generate Judul Sekarang'}
          </button>
        </form>

        {/* Area Hasil */}
        {hasil.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Rekomendasi Judul:</h2>
            <div className="grid gap-3">
              {hasil.map((judul, index) => (
                <div key={index} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-zinc-800 dark:text-zinc-200">{judul}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}