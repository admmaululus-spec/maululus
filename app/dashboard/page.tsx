'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase'; 
import Link from 'next/link';

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <div className="group relative flex items-center">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 pointer-events-none leading-relaxed text-center">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

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
       
       // --- TAMBAHKAN EMAIL DI SINI ---
       const { data: newUser } = await supabase.from('users_data').insert({ 
         id: userId, 
         koin: 1, 
         is_pro: false, 
         whatsapp: metaWhatsapp,
         email: session.user.email 
       }).select('*').single();
       
       userData = newUser;
     } else {
       // JIKA USER SUDAH ADA TAPI EMAILNYA MASIH KOSONG (KARENA DIA USER LAMA), KITA UPDATE
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
      
      // Jika tetap kosong (misal login via Google), tampilkan teks ramah
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

  if (isLoading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold tracking-tight text-slate-900 uppercase">Maululus</div>
            {isPro ? (
              <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">Pro Plan</span>
            ) : (
              <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Free</span>
            )}
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold text-slate-700">🪙 {koin} Koin</span>
            <button onClick={handleLogout} className="text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        
        {/* TAB NAVIGATION */}
        <div className="flex border-b border-slate-200 mb-10">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-2 mr-8 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'overview' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('profil')}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'profil' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Profil Akun
          </button>
        </div>

        
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-10">
              <h1 className="text-2xl font-bold text-slate-900">Halo, {userEmail?.split('@')[0]} 👋</h1>
              <p className="text-slate-500 text-sm mt-1">Lanjutkan progres skripsimu hari ini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Link href="/dashboard/upgrade" className="w-full block bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white hover:bg-slate-800 transition-all shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 text-center">Billing</p>
                <p className="text-center font-bold">Top-Up & Paket</p>
              </Link>
              <Link href="/generator" className="w-full block bg-white border border-slate-200 p-6 rounded-2xl hover:border-slate-400 transition-all shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 text-center">Academic</p>
                <p className="text-center font-bold">Generate Judul</p>
              </Link>
              <Link href="/dashboard/copilot" className="w-full block bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-400 transition-all shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1 text-center">Writing Tool</p>
                <p className="text-center font-bold text-indigo-600">AI Copilot</p>
              </Link>
            </div>

            <section>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Dokumen Tersimpan</h2>
              <div className="space-y-4">
                {riwayatList.length > 0 ? (
                  riwayatList.map((item) => (
                    <div key={item.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 hover:border-slate-300 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 leading-tight">{item.judul}</h3>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-tighter">Disimpan pada: {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                      </div>
                      {item.is_unlocked ? (
                        <button onClick={() => router.push(`/dashboard/dokumen?id=${item.id}`)} className="bg-slate-100 text-slate-900 px-6 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all border border-slate-200 shrink-0">Buka Dokumen</button>
                      ) : (
                        <button onClick={() => handleBukaKunci(item.id)} disabled={isProcessing === item.id} className="bg-slate-900 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shrink-0">
                          {isProcessing === item.id ? 'Memproses...' : 'Buka Kunci (1 Koin)'}
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-16 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-sm font-medium">Belum ada dokumen skripsi.</div>
                )}
              </div>
            </section>
          </div>
        )}

        
        {activeTab === 'profil' && (
          <div className="animate-in fade-in duration-300 max-w-2xl">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 sm:p-10 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4">Informasi Akun</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="flex items-center justify-between bg-slate-50 px-5 py-4 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-800">{userEmail}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Verified</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">WhatsApp</label>
                  <div className="flex items-center bg-slate-50 px-5 py-4 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-800">{userWhatsapp}</span>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Status Paket</p>
                    <p className="text-lg font-black text-indigo-700">{isPro ? 'PRO SCHOLAR' : 'FREE ACCOUNT'}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Koin Tersedia</p>
                    <p className="text-lg font-black text-slate-700">{koin} Koin</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 mt-8 flex justify-end">
                  <Link href="/dashboard/upgrade" className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition-all text-sm">
                    Tingkatkan Layanan
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