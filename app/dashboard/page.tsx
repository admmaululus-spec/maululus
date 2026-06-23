'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase'; 
import Link from 'next/link';

// --- TYPES DEKLARASI ---
type RiwayatItem = { id: string; judul: string; outline: any; is_unlocked: boolean; created_at: string };
// Tambahkan user_id agar kita tahu dompet (E-Wallet) mana yang harus ditransfer koinnya
type Analyst = { id: string; user_id: string; name: string; expertise: string; price: number; photo_url: string; is_wa_enabled: boolean; wa_number: string };

export default function DashboardPage() {
  const router = useRouter();
  
  // UI States
  const [activeTab, setActiveTab] = useState<'overview' | 'profil'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Data States
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('Mahasiswa');
  const [userWhatsapp, setUserWhatsapp] = useState('');
  const [koin, setKoin] = useState(0); 
  const [isPro, setIsPro] = useState(false);
  
  const [riwayatList, setRiwayatList] = useState<RiwayatItem[]>([]);
  const [analysts, setAnalysts] = useState<Analyst[]>([]);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // 1. Autentikasi
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) return router.push('/auth');
        
        const currentUserId = session.user.id;
        const currentUserEmail = session.user.email || 'Mahasiswa';
        
        setUserId(currentUserId);
        setUserEmail(currentUserEmail);

        // 2. Sinkronisasi Data Tertunda (Local Storage)
        await syncPendingData(currentUserId);

        // 3. 🚀 PARALLEL FETCHING (Ambil Semua Data Secara Bersamaan untuk Efisiensi)
        const [userRes, historyRes, analystsRes] = await Promise.all([
          supabase.from('users_data').select('*').eq('id', currentUserId).maybeSingle(),
          supabase.from('history_skripsi').select('*').eq('user_id', currentUserId).order('created_at', { ascending: false }),
          // Tambahkan user_id di kueri select di bawah ini
          supabase.from('analyst_profiles').select('id, user_id, name, expertise, price, photo_url, is_wa_enabled, wa_number').order('created_at', { ascending: false })
        ]);

        // 4. Handle Sinkronisasi Tabel User (Jika belum ada di users_data)
        let userData = userRes.data;
        if (!userData) {
          const metaWhatsapp = session.user.user_metadata?.whatsapp || '';
          const { data: newUser } = await supabase.from('users_data').insert({ 
            id: currentUserId, koin: 1, is_pro: false, whatsapp: metaWhatsapp, email: currentUserEmail 
          }).select().single();
          userData = newUser;
        } else {
          // Update data jika email/wa kosong di DB tapi ada di session
          const updates: any = {};
          if (!userData.email && currentUserEmail !== 'Mahasiswa') updates.email = currentUserEmail;
          if (!userData.whatsapp && session.user.user_metadata?.whatsapp) updates.whatsapp = session.user.user_metadata.whatsapp;
          
          if (Object.keys(updates).length > 0) {
            await supabase.from('users_data').update(updates).eq('id', currentUserId);
            userData = { ...userData, ...updates };
          }
        }

        // 5. Update Semua States Sekaligus
        setKoin(userData?.koin || 0);
        setIsPro(userData?.is_pro || false);
        setUserWhatsapp(userData?.whatsapp || 'Belum diatur');
        setRiwayatList(historyRes.data || []);
        setAnalysts(analystsRes.data || []);

      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeDashboard();
  }, [router]);

  // Fungsi utilitas sinkronisasi yang dipisahkan agar bersih
  const syncPendingData = async (uid: string) => {
    const pendingJudul = localStorage.getItem('maululus_pending_judul');
    const pendingOutline = localStorage.getItem('maululus_pending_outline');

    if (pendingJudul && pendingOutline) {
      const { data: checkExist } = await supabase.from('history_skripsi').select('id').eq('user_id', uid).eq('judul', pendingJudul).maybeSingle();
      if (!checkExist) {
        await supabase.from('history_skripsi').insert({ user_id: uid, judul: pendingJudul, outline: JSON.parse(pendingOutline), is_unlocked: false });
      }
      ['maululus_pending_judul', 'maululus_pending_outline', 'maululus_history'].forEach(key => localStorage.removeItem(key));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  const handleBukaKunci = async (id_skripsi: string) => {
    if (koin < 1) return alert('Koin tidak cukup! Silakan top-up terlebih dahulu.');
    
    setIsProcessing(id_skripsi);
    try {
      const { error } = await supabase.from('users_data').update({ koin: koin - 1 }).eq('id', userId);
      if (error) throw error;

      await supabase.from('history_skripsi').update({ is_unlocked: true }).eq('id', id_skripsi);
      setKoin(prev => prev - 1);
      setRiwayatList(prev => prev.map(item => item.id === id_skripsi ? { ...item, is_unlocked: true } : item));
    } catch (err) {
      alert("Gagal membuka dokumen, coba lagi nanti.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleChatAnalis = async (analis: Analyst) => {
    if (analis.is_wa_enabled && analis.wa_number) {
      const waLink = `https://wa.me/${analis.wa_number.replace(/^0/, '62')}?text=Halo%20kak%20${analis.name},%20saya%20ingin%20konsultasi%20skripsi%20dari%20Maululus.`;
      window.open(waLink, '_blank');
      return;
    }

    if (koin < analis.price) {
      alert(`Koin tidak cukup! Kamu butuh ${analis.price} Koin.`);
      router.push('/dashboard/upgrade');
      return;
    }

    if (!confirm(`Potong ${analis.price} Koin untuk chat dengan ${analis.name}?`)) return;

    setIsProcessing(`chat_${analis.id}`);

    // --- SNAPSHOT SALDO AWAL UNTUK ROLLBACK ---
    const initialUserKoin = koin;
    let initialAnalystKoin = 0;

    if (analis.user_id) {
      const { data: dataAnalis } = await supabase.from('users_data').select('koin').eq('id', analis.user_id).single();
      initialAnalystKoin = dataAnalis?.koin || 0;
    }
    // ------------------------------------------

    try {
      // 1. Potong koin mahasiswa
      const { error: koinError } = await supabase.from('users_data').update({ koin: initialUserKoin - analis.price }).eq('id', userId);
      if (koinError) throw koinError;
      setKoin(initialUserKoin - analis.price); // Update UI sementara

      // 2. Transfer koin ke Analis
      if (analis.user_id) {
        const { error: transferError } = await supabase.from('users_data').update({ koin: initialAnalystKoin + analis.price }).eq('id', analis.user_id);
        if (transferError) throw transferError;
      }

      // 3. Buat sesi chat
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({ user_id: userId, analyst_id: analis.id, stage: 'Konsultasi Awal' })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Sukses! Lempar ke ruang chat
      router.push(`/chat/${newSession.id}`);
      
    } catch (err: any) {
      console.error("Gagal transaksi:", err);
      
      // 🚨 SISTEM ROLLBACK (PENGEMBALIAN DANA OTOMATIS) 🚨
      await supabase.from('users_data').update({ koin: initialUserKoin }).eq('id', userId);
      if (analis.user_id) {
        await supabase.from('users_data').update({ koin: initialAnalystKoin }).eq('id', analis.user_id);
      }
      setKoin(initialUserKoin); // Kembalikan angka di UI
      
      alert(`Terjadi kesalahan sistem. Saldo ${analis.price} Koin Anda telah dikembalikan dengan aman.`);
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 selection:bg-emerald-200">
      
      {/* HEADER ELEGAN */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 transition-all shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl font-extrabold tracking-tight text-[#0D1C2E]">Mau<span className="text-emerald-500">lulus</span></div>
            <div className="h-4 w-px bg-slate-300 mx-1"></div>
            {isPro ? (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest shadow-sm">Pro</span>
            ) : (
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Basic</span>
            )}
          </div>
          <div className="flex items-center gap-5">
            <Link href="/dashboard/upgrade" className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm transition-colors cursor-pointer">
              <span className="text-sm">🪙</span>
              <span className="text-xs font-bold text-emerald-700">{koin} Koin</span>
            </Link>
            <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        
        {/* NAVIGASI TAB PILL (SaaS Style) */}
        <div className="flex justify-center md:justify-start mb-10">
          <div className="inline-flex bg-slate-200/50 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'overview' ? 'bg-white text-[#0D1C2E] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('profil')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'profil' ? 'bg-white text-[#0D1C2E] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Profil Akun
            </button>
          </div>
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-12">
            
            <div>
              <h1 className="text-3xl font-extrabold text-[#0D1C2E] tracking-tight">Halo, {userEmail.split('@')[0]}</h1>
              <p className="text-slate-500 text-sm mt-2 font-medium">Lanjutkan progress skripsimu hari ini.</p>
            </div>

            {/* QUICK ACTIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link href="/generator" className="group relative bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 overflow-hidden">
                <div className="h-10 w-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Academic</p>
                <p className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Buat Skripsi Baru</p>
              </Link>

              <Link href="/dashboard/copilot" className="group relative bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 overflow-hidden">
                <div className="h-10 w-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Writing Tool</p>
                <p className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">AI Copilot</p>
              </Link>

              <Link href="/dashboard/upgrade" className="group bg-[#0D1C2E] border border-[#1a3556] p-6 rounded-[2rem] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-10 w-10 bg-[#1a3556] rounded-2xl flex items-center justify-center text-amber-400 mb-4 border border-[#2b4c73]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 mb-1">Billing</p>
                <p className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Top-Up Koin</p>
              </Link>
            </div>

            {/* ✨ SEKSI BARU: KONSULTASI ANALIS */}
            <section className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Konsultasi Pakar Analis</h2>
                  <p className="text-sm text-slate-500 mt-1">Chat langsung dengan ahli untuk memecahkan kebuntuan skripsimu.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {analysts.map((analyst) => (
                  <div key={analyst.id} className="border border-slate-100 bg-slate-50 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <img src={analyst.photo_url || 'https://via.placeholder.com/60'} alt={analyst.name} className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm mb-3" />
                      <h3 className="font-bold text-slate-800 text-sm leading-tight">{analyst.name}</h3>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5 mb-4 line-clamp-2">{analyst.expertise}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleChatAnalis(analyst)}
                      disabled={isProcessing === `chat_${analyst.id}`}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 
                        ${analyst.is_wa_enabled 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        } disabled:opacity-50`}
                    >
                      {isProcessing === `chat_${analyst.id}` ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"></div>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.43 3.43 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" /></svg>
                          {analyst.is_wa_enabled ? 'Chat WA (Gratis)' : `Chat (${analyst.price} Koin)`}
                        </>
                      )}
                    </button>
                  </div>
                ))}
                {analysts.length === 0 && (
                  <div className="col-span-full py-10 text-center text-slate-400 text-sm font-medium">Belum ada analis yang tersedia saat ini.</div>
                )}
              </div>
            </section>

            {/* DOKUMEN TERSIMPAN */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Dokumen Skripsi Kamu</h2>
                <span className="bg-white text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200">{riwayatList.length} File</span>
              </div>
              
              <div className="space-y-3">
                {riwayatList.length > 0 ? (
                  riwayatList.map((item) => (
                    <div key={item.id} className="group bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-200 hover:shadow-sm transition-all duration-300">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-colors">
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
                        <button onClick={() => handleBukaKunci(item.id)} disabled={isProcessing === item.id} className="w-full md:w-auto bg-[#0D1C2E] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1a3556] shadow-sm transition-all shrink-0 active:scale-95 disabled:opacity-70 text-center flex justify-center items-center gap-2">
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
                  <div className="py-20 bg-white border border-slate-200 border-dashed rounded-[2rem] text-center flex flex-col items-center justify-center">
                    <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m11.25 14.25a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9c0-1.242.75-2.25 1.875-2.25h.75m10.5 12.75h-3m-3 0h-3m-3 0H6.75" /></svg>
                    </div>
                    <p className="text-slate-500 font-medium text-sm">Belum ada skripsi yang dibuat.</p>
                    <Link href="/generator" className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-700">Mulai generate sekarang &rarr;</Link>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ================= TAB 2: PROFIL ================= */}
        {activeTab === 'profil' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl mx-auto md:mx-0">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                <div className="h-16 w-16 bg-[#0D1C2E] rounded-full flex items-center justify-center text-white text-2xl font-black shadow-inner">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#0D1C2E]">{userEmail.split('@')[0]}</h2>
                  <p className="text-sm text-slate-500 font-medium">Mahasiswa Akhir</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="flex items-center justify-between bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100">
                    <span className="font-semibold text-slate-800 text-sm">{userEmail}</span>
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">Terverifikasi</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">WhatsApp</label>
                  <div className="flex items-center bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100">
                    <span className="font-semibold text-slate-800 text-sm">{userWhatsapp}</span>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Langganan</p>
                    <p className={`text-lg font-black ${isPro ? 'text-emerald-500' : 'text-slate-700'}`}>
                      {isPro ? 'PRO PLAN' : 'BASIC FREE'}
                    </p>
                  </div>
                  <div className="bg-[#0D1C2E] border border-[#1a3556] rounded-2xl p-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Koin Tersedia</p>
                    <p className="text-lg font-black text-amber-400">{koin} Koin</p>
                  </div>
                </div>

                <div className="pt-8 mt-4 flex justify-end">
                  <Link href="/dashboard/upgrade" className="bg-[#0D1C2E] text-white font-bold py-3.5 px-8 rounded-2xl hover:bg-[#1a3556] transition-all text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0">
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