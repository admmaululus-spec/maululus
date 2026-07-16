'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Sidebar from './components/Sidebar';
import CenterContent from './components/CenterContent';
import RightPanel from './components/RightPanel';

type RiwayatItem = { id: string; judul?: string; outline?: any; is_unlocked?: boolean; tool_name?: string; input_data?: string; result_data?: any; created_at: string };

export default function DashboardPage() {
  const router = useRouter();

  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('Mahasiswa');
  const [userWhatsapp, setUserWhatsapp] = useState('');
  const [koin, setKoin] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [riwayatList, setRiwayatList] = useState<RiwayatItem[]>([]);
  const [premiumProjects, setPremiumProjects] = useState<any[]>([]);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) return router.push('/auth');

        const currentUserId = session.user.id;
        const currentUserEmail = session.user.email || 'Mahasiswa';
        setUserId(currentUserId);
        setUserEmail(currentUserEmail);

        await syncPendingData(currentUserId);

        const [userRes, historyRes, proyekRes, aiHistoryRes] = await Promise.all([
          supabase.from('users_data').select('*').eq('id', currentUserId).maybeSingle(),
          supabase.from('history_skripsi').select('*').eq('user_id', currentUserId).order('created_at', { ascending: false }),
          supabase.from('premium_projects').select('*').eq('user_id', currentUserId).eq('is_active', true).order('created_at', { ascending: false }),
          supabase.from('ai_tools_history').select('*').eq('user_id', currentUserId).order('created_at', { ascending: false })
        ]);

        if (proyekRes.error) {
          console.error("Gagal load premium_projects:", proyekRes.error.message);
        }

        let userData = userRes.data;
        // Buat data user baru jika belum ada di tabel users_data
        if (!userData) {
          const metaWhatsapp = session.user.user_metadata?.whatsapp || '';
          const { data: newUser } = await supabase.from('users_data').insert({
            id: currentUserId, koin: 1, is_pro: false, whatsapp: metaWhatsapp, email: currentUserEmail
          }).select().single();
          userData = newUser;
        }

        setKoin(userData?.koin || 0);
        setIsPro(userData?.is_pro || false);
        setUserWhatsapp(userData?.whatsapp || 'Belum diatur');
        setPremiumProjects(proyekRes.data || []);

        // Menggabungkan dan mengurutkan riwayat AI & Skripsi
        const combinedHistory = [...(historyRes.data || []), ...(aiHistoryRes.data || [])];
        combinedHistory.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRiwayatList(combinedHistory);

      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initializeDashboard();
  }, [router]);

  // PERBAIKAN: Menambahkan Try-Catch pada parse JSON agar dashboard tidak blank
  const syncPendingData = async (uid: string) => {
    const pendingJudul = localStorage.getItem('maululus_pending_judul');
    const pendingOutline = localStorage.getItem('maululus_pending_outline');
    
    if (pendingJudul && pendingOutline) {
      try {
        const parsedOutline = JSON.parse(pendingOutline);
        const { data: checkExist } = await supabase.from('history_skripsi').select('id').eq('user_id', uid).eq('judul', pendingJudul).maybeSingle();
        
        if (!checkExist) {
          await supabase.from('history_skripsi').insert({ 
            user_id: uid, 
            judul: pendingJudul, 
            outline: parsedOutline, 
            is_unlocked: false 
          });
        }
      } catch (e) {
        console.error("Format data outline di localStorage tidak valid", e);
      } finally {
        // Selalu bersihkan localStorage entah proses insert berhasil atau gagal
        ['maululus_pending_judul', 'maululus_pending_outline', 'maululus_history'].forEach(key => localStorage.removeItem(key));
      }
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
      await supabase.from('users_data').update({ koin: koin - 1 }).eq('id', userId);
      await supabase.from('history_skripsi').update({ is_unlocked: true }).eq('id', id_skripsi);
      
      setKoin(prev => prev - 1);
      setRiwayatList(prev => prev.map(item => item.id === id_skripsi ? { ...item, is_unlocked: true } : item));
    } catch (err) {
      alert("Gagal membuka dokumen, coba lagi nanti.");
    } finally {
      setIsProcessing(null);
    }
  };

  const userName = userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1);

  if (isLoading) return (
    <div className="h-[100dvh] w-full bg-[#F4F7FE] flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#3b82f6]"></div>
    </div>
  );

  return (
    // Menggunakan h-full karena tinggi 100dvh sudah di-handle oleh layout.tsx
    <div className="flex h-full w-full bg-[#F4F7FE] font-sans text-slate-800 overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} activeMenu={activeMenu} setActiveMenu={setActiveMenu} userName={userName} isPro={isPro} handleLogout={handleLogout} />
      
      <CenterContent activeMenu={activeMenu} setActiveMenu={setActiveMenu} setIsSidebarOpen={setIsSidebarOpen} userName={userName} userEmail={userEmail} userWhatsapp={userWhatsapp} koin={koin} riwayatList={riwayatList} premiumProjects={premiumProjects} handleBukaKunci={handleBukaKunci} isProcessing={isProcessing} router={router} />
      
      <RightPanel activeMenu={activeMenu} setActiveMenu={setActiveMenu} koin={koin} isPro={isPro} />
    </div>
  );
}