'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function AdminBroadcastPage() {
  const [waList, setWaList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchKontak = async () => {
      // Ambil data users yang field whatsapp-nya tidak kosong
      const { data } = await supabase.from('users_data').select('whatsapp').not('whatsapp', 'is', null).neq('whatsapp', '');
      
      if (data) {
        // Bersihkan duplikat dan ambil hanya nomornya
        const uniqueWA = Array.from(new Set(data.map(u => u.whatsapp)));
        setWaList(uniqueWA);
      }
      setIsLoading(false);
    };
    fetchKontak();
  }, []);

  const handleCopy = () => {
    // Format nomor menggunakan pemisah koma (format standar aplikasi broadcast)
    navigator.clipboard.writeText(waList.join(', '));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  if (isLoading) return <div className="text-slate-400 font-bold animate-pulse">Mengumpulkan data kontak...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Export Kontak WA</h1>
        <p className="text-slate-500 mt-1 text-sm">Ambil database nomor WhatsApp untuk keperluan promosi atau pemberitahuan.</p>
      </div>

      <div className="bg-white border border-slate-200/60 p-8 rounded-[1.5rem] shadow-sm">
        
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>
            <span className="text-xs font-bold text-indigo-700">{waList.length} Nomor Ditemukan</span>
          </div>

          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-md"
          >
            {isCopied ? (
              <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> Tersalin!</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg> Copy Semua Nomor</>
            )}
          </button>
        </div>

        {/* Text Area untuk visualisasi (Read Only) */}
        <textarea 
          readOnly 
          value={waList.join(', ')}
          className="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 font-mono focus:outline-none resize-none"
          placeholder="Database kontak WhatsApp akan muncul di sini..."
        />
        
        <p className="text-[10px] text-slate-400 mt-4 font-medium leading-relaxed">
          * Catatan: Data Email tidak diexport di sini karena alasan privasi dari Database.
        </p>

      </div>
    </div>
  );
}