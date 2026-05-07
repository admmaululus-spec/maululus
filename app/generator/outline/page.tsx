'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase'; // Import supabase!
import Link from 'next/link';

type SubBab = { judul: string; deskripsi: string };
type OutlineData = { bab: string; subBab: SubBab[] };

function OutlineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const judul = searchParams.get('judul');

  const [isLoading, setIsLoading] = useState(true);
  const [hasilOutline, setHasilOutline] = useState<OutlineData[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Deteksi status login
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!judul) {
      router.push('/generator');
      return;
    }

    // Fungsi cek user
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    const fetchOutline = async () => {
      try {
        const response = await fetch('/api/generate-outline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ judul }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Gagal menyusun kerangka');
        setHasilOutline(data.outline || []);
      } catch (error: any) {
        setErrorMsg(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    fetchOutline();
  }, [judul, router]);

  // LOGIKA BARU: Simpan langsung ke Supabase dengan Error Handling
  const handleSaveAndContinue = async () => {
    if (isLoggedIn) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // BUG FIX: Gunakan .maybeSingle() agar tidak error jika data kosong
          const { data: checkExist } = await supabase
            .from('history_skripsi')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('judul', judul)
            .maybeSingle(); 

          // Jika belum ada, masukkan ke Supabase
          if (!checkExist) {
            const { error: insertError } = await supabase.from('history_skripsi').insert({
              user_id: session.user.id,
              judul: judul,
              outline: hasilOutline,
              is_unlocked: false
            });
            
            if (insertError) throw insertError; // Tangkap jika ada error saat insert
          }
          router.push('/dashboard');
          return;
        }
      } catch (error: any) {
        console.error("Gagal simpan ke database:", error);
        alert("Terjadi kesalahan saat menyimpan ke cloud. Coba lagi.");
        return; // Hentikan agar tidak lanjut ke Auth
      }
    } 
    
    // Jika BELUM LOGIN, titipkan ke Local Storage sebagai "Draft"
    localStorage.setItem('maululus_pending_judul', judul as string);
    localStorage.setItem('maululus_pending_outline', JSON.stringify(hasilOutline));
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="mx-auto max-w-4xl space-y-8">
        
        <button onClick={() => router.back()} className="text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-2 mb-4 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m15 18-6-6 6-6"/></svg>
          Kembali Pilih Judul
        </button>

        <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <p className="text-blue-200 font-medium mb-2 relative z-10">Judul Skripsi Pilihanmu:</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-snug relative z-10">{judul}</h1>
        </div>

        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm mt-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-800 font-bold text-lg">Menyusun Kerangka BAB 1 - 5 & Referensi...</p>
          </div>
        )}

        {!isLoading && hasilOutline.length > 0 && (
          <div className="relative rounded-[2rem] bg-white p-6 sm:p-10 shadow-xl border border-slate-200 overflow-hidden mt-8">
            <div className="space-y-10 max-h-[600px] overflow-hidden opacity-90 pr-4">
              {hasilOutline.map((item, idx) => (
                <div key={idx} className="space-y-4">
                  {/* Gaya visual berbeda untuk BAB Referensi agar lebih stand out */}
                  <h3 className={`text-2xl font-extrabold border-b-2 pb-2 inline-block ${item.bab.includes('REFERENSI') || item.bab.includes('📚') ? 'text-amber-600 border-amber-200' : 'text-blue-800 border-blue-100'}`}>
                    {item.bab}
                  </h3>
                  <div className="space-y-4 pl-2">
                    {item.subBab?.map((sub, sIdx) => (
                      <div key={sIdx} className="space-y-2">
                        <h4 className="font-bold text-slate-800 text-lg">{sub.judul}</h4>
                        <p className="text-slate-600 leading-relaxed text-sm mb-2">{sub.deskripsi}</p>
                        
                        {/* TOMBOL GOOGLE SCHOLAR */}
                        <a 
                          href={`https://scholar.google.com/scholar?q=${encodeURIComponent(judul + ' ' + sub.judul)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-all w-fit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                          </svg>
                          Cari Referensi di Google Scholar
                        </a>

                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-white via-white/95 to-transparent flex flex-col items-center justify-end pb-12 px-6">
              <div className="pointer-events-auto w-full max-w-md rounded-3xl bg-slate-900 p-8 text-center shadow-2xl transform transition-transform hover:-translate-y-2 border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300"></div>
                <div className="text-5xl mb-4">🔒</div>
                <h4 className="text-2xl font-extrabold text-white mb-2">Simpan & Buka Akses</h4>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Gunakan <span className="font-bold text-amber-400">1 Koin</span> untuk membuka struktur detail dari BAB 1 - BAB 5 beserta fitur Copy/Download.
                </p>
                
                {/* Tombol Pintar Baru */}
                <button 
                  onClick={handleSaveAndContinue}
                  className="w-full rounded-2xl bg-amber-400 px-6 py-4 font-bold text-slate-900 hover:bg-amber-500 transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex justify-center items-center gap-2"
                >
                  {isLoggedIn ? 'Simpan ke Dashboard' : 'Login & Simpan'}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OutlinePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div></div>}>
      <OutlineContent />
    </Suspense>
  );
}