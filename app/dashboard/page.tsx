'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase'; 
import Link from 'next/link';

type RiwayatItem = { id: string; judul: string; outline: any; is_unlocked: boolean; created_at: string };

export default function DashboardPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'profil'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // User States
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userWhatsapp, setUserWhatsapp] = useState('');
  const [koin, setKoin] = useState(0); 
  const [isPro, setIsPro] = useState(false);
  
  const [riwayatList, setRiwayatList] = useState<RiwayatItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) { router.push('/auth'); return; }
      
      setUserEmail(session.user.email || 'Mahasiswa');
      const userId = session.user.id;

      // 1. SINKRONISASI DARI LOCAL STORAGE (Untuk auto-save kerangka)
      const pendingJudul = localStorage.getItem('maululus_pending_judul');
      const pendingOutline = localStorage.getItem('maululus_pending_outline');

      if (pendingJudul && pendingOutline) {
        const { data: checkExist } = await supabase.from('history_skripsi').select('id').eq('user_id', userId).eq('judul', pendingJudul).maybeSingle();
        if (!checkExist) {
          await supabase.from('history_skripsi').insert({ user_id: userId, judul: pendingJudul, outline: JSON.parse(pendingOutline), is_unlocked: false });
        }
        localStorage.removeItem('maululus_pending_judul');
        localStorage.removeItem('maululus_pending_outline');
        localStorage.removeItem('maululus_history');
      }

     // 2. AMBIL DATA USER
     let { data: userData } = await supabase.from('users_data').select('*').eq('id', userId).maybeSingle();
      
     if (!userData) {
       const metaWhatsapp = session.user.user_metadata?.whatsapp || '';
       const { data: newUser } = await supabase.from('users_data').insert({ 
         id: userId, 
         koin: 1, 
         is_pro: false, 
         whatsapp: metaWhatsapp,
         email: session.user.email 
       }).select('*').single();
       userData = newUser;
     } else {
       let updates: any = {};
       if (!userData.email && session.user.email) updates.email = session.user.email;
       if (!userData.whatsapp && session.user.user_metadata?.whatsapp) updates.whatsapp = session.user.user_metadata.whatsapp;
       if (Object.keys(updates).length > 0) {
         await supabase.from('users_data').update(updates).eq('id', userId);
         userData = { ...userData, ...updates };
       }
     }
      // Pasang ke State
      setKoin(userData?.koin || 0);
      setIsPro(userData?.is_pro || false);
      setUserWhatsapp(userData?.whatsapp ? userData.whatsapp : 'Belum diatur (Login via Google)');

      // 3. AMBIL RIWAYAT SKRIPSI
      const { data: historyData } = await supabase.from('history_skripsi').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      setRiwayatList(historyData || []);
      
      setIsLoading(false);
    };
    
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const handleBukaKunci = async (id_skripsi: string) => {
    if (koin < 1) { alert('Koin tidak cukup! Silakan top-up terlebih dahulu.'); return; }
    setIsProcessing(id_skripsi);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error: errorKoin } = await supabase.from('users_data').update({ koin: koin - 1 }).eq('id', session.user.id);
    if (!errorKoin) {
      await supabase.from('history_skripsi').update({ is_unlocked: true }).eq('id', id_skripsi);
      setKoin(prev => prev - 1);
      setRiwayatList(prev => prev.map(item => item.id === id_skripsi ? { ...item, is_unlocked: true } : item));
    }
    setIsProcessing(null);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20 selection:bg-blue-200">
      
      {/* HEADER ELEGAN */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl font-extrabold tracking-tight text-blue-700">Mau<span className="text-blue-500">lulus</span></div>
            <div className="h-4 w-px bg-slate-300 mx-1"></div>
            {isPro ? (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest shadow-sm">
                Pro
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Basic</span>
            )}
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full shadow-sm">
              <span className="text-sm">🪙</span>
              <span className="text-xs font-bold text-amber-700">{koin} Koin</span>
            </div>
            <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        
        {/* NAVIGASI TAB PILL (SaaS Style) */}
        <div className="flex justify-center md:justify-start mb-10">
          <div className="inline-flex bg-slate-200/50 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('profil')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'profil' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Profil Akun
            </button>
          </div>
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            <div className="mb-10">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Halo, {userEmail?.split('@')[0]} 👋</h1>
              <p className="text-slate-500 text-sm mt-2 font-medium">Lanjutkan progres skripsimu hari ini dan segera wisuda.</p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
              
              <Link href="/generator" className="group relative bg-white border border-slate-200/60 p-6 rounded-[2rem] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-blue-600"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
                </div>
                <div className="h-10 w-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Academic</p>
                <p className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Buat Skripsi Baru</p>
              </Link>

              <Link href="/dashboard/copilot" className="group relative bg-white border border-slate-200/60 p-6 rounded-[2rem] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-indigo-600"><path d="M19.045 7.401c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.378-.378-.88-.586-1.414-.586s-1.036.208-1.414.586l-1.586 1.586c-.378.378-.586.88-.586 1.414s.208 1.036.586 1.414l1.586 1.586c.378.378.88.586 1.414.586s1.036-.208 1.414-.586l1.586-1.586zM20.459 6.2c.2.2.2.51 0 .71l-1.586 1.586c-.2.2-.51.2-.71 0l-1.586-1.586c-.2-.2-.2-.51 0-.71l1.586-1.586c.2-.2.51-.2.71 0l1.586 1.586zM4 20h2.586L15.172 11.414 12.586 8.828 4 17.414V20z"/></svg>
                </div>
                <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Writing Tool</p>
                <p className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">AI Copilot</p>
              </Link>

              <Link href="/dashboard/upgrade" className="group bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-lg hover:shadow-slate-900/20 hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 bg-slate-800 rounded-2xl flex items-center justify-center text-amber-400 mb-4 border border-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Billing</p>
                <p className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Top-Up Koin</p>
              </Link>
            </div>

            {/* Dokumen Tersimpan */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Dokumen Skripsi Kamu</h2>
                <span className="bg-slate-200/50 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-lg">{riwayatList.length} File</span>
              </div>
              
              <div className="space-y-3">
                {riwayatList.length > 0 ? (
                  riwayatList.map((item) => (
                    <div key={item.id} className="group bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all duration-300">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 text-sm truncate">{item.judul}</h3>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-widest">
                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {item.is_unlocked ? (
                        <button onClick={() => router.push(`/dashboard/dokumen?id=${item.id}`)} className="w-full md:w-auto bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 border border-slate-200 transition-all shrink-0 active:scale-95 text-center">
                          Lihat Dokumen
                        </button>
                      ) : (
                        <button onClick={() => handleBukaKunci(item.id)} disabled={isProcessing === item.id} className="w-full md:w-auto bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 shadow-sm transition-all shrink-0 active:scale-95 disabled:opacity-70 text-center flex justify-center items-center gap-2">
                          {isProcessing === item.id ? (
                             <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-white"></div>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-amber-400"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                              Buka (1 Koin)
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-20 bg-white border border-slate-200/60 border-dashed rounded-[2rem] text-center flex flex-col items-center justify-center">
                    <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m11.25 14.25a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9c0-1.242.75-2.25 1.875-2.25h.75m10.5 12.75h-3m-3 0h-3m-3 0H6.75" /></svg>
                    </div>
                    <p className="text-slate-500 font-medium text-sm">Belum ada skripsi yang dibuat.</p>
                    <Link href="/generator" className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700">Mulai generate sekarang &rarr;</Link>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ================= TAB 2: PROFIL ================= */}
        {activeTab === 'profil' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl mx-auto md:mx-0">
            <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-inner">
                  {userEmail?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">{userEmail?.split('@')[0]}</h2>
                  <p className="text-sm text-slate-500 font-medium">Mahasiswa Akhir</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="flex items-center justify-between bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100">
                    <span className="font-semibold text-slate-800 text-sm">{userEmail}</span>
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">Terverifikasi</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">WhatsApp</label>
                  <div className="flex items-center bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100">
                    <span className="font-semibold text-slate-800 text-sm">{userWhatsapp}</span>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 rounded-2xl p-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Langganan</p>
                    <p className={`text-lg font-black ${isPro ? 'text-indigo-600' : 'text-slate-700'}`}>
                      {isPro ? 'PRO PLAN' : 'BASIC FREE'}
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                    <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest mb-1">Koin Tersedia</p>
                    <p className="text-lg font-black text-amber-600">{koin} Koin</p>
                  </div>
                </div>

                <div className="pt-8 mt-4 flex justify-end">
                  <Link href="/dashboard/upgrade" className="bg-slate-900 text-white font-bold py-3.5 px-8 rounded-2xl hover:bg-slate-800 transition-all text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
                    Kelola Tagihan & Paket
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}