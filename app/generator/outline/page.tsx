'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

type SubBab = { judul: string; deskripsi: string; url_asli?: string };
type OutlineData = { bab: string; subBab: SubBab[] };

function OutlineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const judul = searchParams.get('judul');
  const jenisRaw = searchParams.get('jenis') || 'Skripsi'; 
  const jenis = jenisRaw.charAt(0).toUpperCase() + jenisRaw.slice(1);

  const [isLoading, setIsLoading] = useState(true);
  const [hasilOutline, setHasilOutline] = useState<OutlineData[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!judul) {
      router.push('/generator');
      return;
    }

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

  const handleSaveAndContinue = async () => {
    if (isLoggedIn) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: checkExist } = await supabase
            .from('history_skripsi')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('judul', judul)
            .maybeSingle(); 

          if (!checkExist) {
            const { error: insertError } = await supabase.from('history_skripsi').insert({
              user_id: session.user.id,
              judul: judul,
              outline: hasilOutline,
              is_unlocked: false
            });
            
            if (insertError) throw insertError;
          }
          router.push('/dashboard');
          return;
        }
      } catch (error: any) {
        console.error("Gagal simpan ke database:", error);
        alert("Terjadi kesalahan saat menyimpan ke cloud. Coba lagi.");
        return;
      }
    } 
    
    localStorage.setItem('maululus_pending_judul', judul as string);
    localStorage.setItem('maululus_pending_jenis', jenis); 
    localStorage.setItem('maululus_pending_outline', JSON.stringify(hasilOutline));
    router.push('/auth');
  };

  // FUNGSI BARU: Langsung arahkan ke Tab Expert Assistance di Dashboard
  const mulaiKonsultasi = async () => {
    // Simpan instruksi buka tab expert di local storage
    localStorage.setItem('maululus_active_menu', 'expert'); 
    
    if (!isLoggedIn) {
      alert("Silakan login terlebih dahulu untuk mengakses layanan Expert.");
      router.push('/auth');
      return;
    }
    
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-brand-light p-6 md:p-12 font-sans">
      <div className="mx-auto max-w-4xl space-y-8">
        
        <button onClick={() => router.back()} className="text-slate-500 hover:text-brand-navy font-semibold flex items-center gap-2 mb-4 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m15 18-6-6 6-6"/></svg>
          Kembali Pilih Judul
        </button>

        <div className="rounded-3xl bg-brand-navy p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <p className="text-gray-300 font-medium mb-2 relative z-10">Judul {jenis} Pilihanmu:</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-snug relative z-10">{judul}</h1>
        </div>

        {isLoading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm mt-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-emerald mx-auto mb-4"></div>
            <p className="text-brand-navy font-bold text-lg">Menyusun Kerangka BAB 1 - 5 & Referensi Asli...</p>
          </div>
        )}

        {!isLoading && hasilOutline.length > 0 && (
          <div className="relative rounded-[2rem] bg-white p-6 sm:p-10 shadow-xl border border-slate-200 overflow-hidden mt-8">
            <div className="space-y-10 max-h-[600px] overflow-hidden opacity-90 pr-4">
              {hasilOutline.map((item, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className={`text-2xl font-extrabold border-b-2 pb-2 inline-block ${item.bab.includes('REFERENSI') || item.bab.includes('📚') ? 'text-brand-emerald border-brand-emerald/30' : 'text-brand-navy border-brand-navy/20'}`}>
                    {item.bab}
                  </h3>
                  <div className="space-y-4 pl-2">
                    {item.subBab?.map((sub, sIdx) => (
                      <div key={sIdx} className="space-y-2">
                        <h4 className="font-bold text-brand-navy text-lg">{sub.judul}</h4>
                        <p className="text-slate-600 leading-relaxed text-sm mb-2">{sub.deskripsi}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-[450px] bg-gradient-to-t from-white via-white/95 to-transparent flex flex-col items-center justify-end pb-8 px-6">
              <div className="pointer-events-auto w-full max-w-md rounded-3xl bg-slate-900 p-8 text-center shadow-2xl transform transition-transform hover:-translate-y-1 border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400"></div>
                <div className="text-5xl mb-4">🔒</div>
                <h4 className="text-2xl font-extrabold text-white mb-2">Simpan & Buka Akses</h4>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  Gunakan <span className="font-bold text-emerald-400">1 Koin</span> untuk membuka struktur detail beserta fitur Copy/Download.
                </p>
                
                <button 
                  onClick={handleSaveAndContinue}
                  className="w-full rounded-2xl bg-emerald-500 px-6 py-4 font-bold text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex justify-center items-center gap-2 mb-6"
                >
                  {isLoggedIn ? 'Simpan ke Dashboard' : 'Login & Simpan'}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>

                {/* AREA MENUJU EXPERT ASSISTANCE */}
                <div className="border-t border-slate-700 pt-6">
                  <p className="text-slate-400 text-sm mb-3">Butuh bantuan menyusun ini?</p>
                  <button 
                    onClick={mulaiKonsultasi}
                    className="w-full rounded-xl bg-[#0B1525] border border-blue-900 px-4 py-3 font-bold text-amber-400 hover:bg-slate-800 hover:text-amber-300 transition-colors flex justify-center items-center gap-2 active:scale-95 shadow-lg"
                  >
                    🎓 Gunakan Expert Assistance
                  </button>
                </div>

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
    <Suspense fallback={<div className="min-h-screen bg-brand-light flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-navy"></div></div>}>
      <OutlineContent />
    </Suspense>
  );
}