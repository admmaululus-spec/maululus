'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase'; 
import Link from 'next/link';

// === KOMPONEN TOOLTIP ===
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

      let { data: userData } = await supabase.from('users_data').select('koin, is_pro').eq('id', userId).maybeSingle();
      if (!userData) {
        const { data: newUser } = await supabase.from('users_data').insert({ id: userId, koin: 1, is_pro: false }).select('koin, is_pro').single();
        userData = newUser;
      }
      
      setKoin(userData?.koin || 0);
      setIsPro(userData?.is_pro || false);

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
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
            <Tooltip text="Sisa koin untuk membuka & mengunduh dokumen skripsi.">
              <span className="text-sm font-bold text-slate-700 cursor-help">🪙 {koin} Koin</span>
            </Tooltip>
            <button onClick={handleLogout} className="text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Utama</h1>
          <p className="text-slate-500 text-sm mt-1">{userEmail}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Tooltip text="Beli Koin atau tingkatkan ke Pro Member.">
            <Link href="/dashboard/upgrade" className="w-full block bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white hover:bg-slate-800 transition-all shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 text-center">Billing</p>
              <p className="text-center font-bold">Top-Up & Paket</p>
            </Link>
          </Tooltip>

          <Tooltip text="Minta AI meracik judul skripsi beserta outline bab 1-5.">
            <Link href="/generator" className="w-full block bg-white border border-slate-200 p-6 rounded-2xl hover:border-slate-400 transition-all shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 text-center">Academic</p>
              <p className="text-center font-bold">Generate Judul</p>
            </Link>
          </Tooltip>

          <Tooltip text="Asisten pintar untuk kembangkan draf & hindari Turnitin.">
            <Link href="/dashboard/copilot" className="w-full block bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-400 transition-all shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1 text-center">Writing Tool</p>
              <p className="text-center font-bold text-indigo-600">AI Copilot</p>
            </Link>
          </Tooltip>
        </div>

        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Dokumen Tersimpan</h2>
          <div className="space-y-4">
            {riwayatList.length > 0 ? (
              riwayatList.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 hover:border-slate-300 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 leading-tight">{item.judul}</h3>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-tighter">
                      Disimpan pada: {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  {item.is_unlocked ? (
                    <button onClick={() => router.push(`/dashboard/dokumen?id=${item.id}`)} className="bg-slate-100 text-slate-900 px-6 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all border border-slate-200 shrink-0">Buka Dokumen</button>
                  ) : (
                    <Tooltip text="Gunakan 1 Koin untuk membuka kunci dan mengunduh (Word/PDF).">
                      <button onClick={() => handleBukaKunci(item.id)} disabled={isProcessing === item.id} className="bg-slate-900 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shrink-0">
                        {isProcessing === item.id ? 'Memproses...' : 'Buka Kunci (1 Koin)'}
                      </button>
                    </Tooltip>
                  )}
                </div>
              ))
            ) : (
              <div className="py-20 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-sm font-medium">Belum ada dokumen skripsi.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}