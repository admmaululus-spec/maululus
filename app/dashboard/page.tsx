// app/dashboard/page.tsx
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
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('Mahasiswa');
  const [userWhatsapp, setUserWhatsapp] = useState('');
  const [userNama, setUserNama] = useState('');
  const [koin, setKoin] = useState(0);
  const [isPro, setIsPro] = useState(false);
  
  const [riwayatList, setRiwayatList] = useState<RiwayatItem[]>([]);
  const [premiumProjects, setPremiumProjects] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]); // TAMBAHAN: State Notifikasi
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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

        // PANGGIL API UNTUK MENG-EVALUASI ATURAN NOTIFIKASI (JALAN DI BACKGROUND)
        fetch('/api/trigger-notif', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId })
        }).catch(err => console.error("Gagal trigger notif:", err));

        // Menarik semua data termasuk Notifikasi
        const [userRes, historyRes, proyekRes, aiHistoryRes, transRes, notifRes] = await Promise.all([
          supabase.from('users_data').select('*').eq('id', currentUserId).maybeSingle(),
          supabase.from('history_skripsi').select('*').eq('user_id', currentUserId).order('created_at', { ascending: false }),
          supabase.from('premium_projects').select('*').eq('user_id', currentUserId).eq('is_active', true).order('created_at', { ascending: false }),
          supabase.from('ai_tools_history').select('*').eq('user_id', currentUserId).order('created_at', { ascending: false }),
          supabase.from('transactions').select('*').eq('user_id', currentUserId).order('created_at', { ascending: false }),
          supabase.from('notifications').select('*').or(`user_id.eq.${currentUserId},user_id.is.null`).order('created_at', { ascending: false })
        ]);

        let userData = userRes.data;
        if (!userData) {
          const metaWhatsapp = session.user.user_metadata?.whatsapp || '';
          const metaNama = session.user.user_metadata?.full_name || '';
          const { data: newUser } = await supabase.from('users_data').insert({
            id: currentUserId, koin: 1, is_pro: false, whatsapp: metaWhatsapp, email: currentUserEmail, nama: metaNama
          }).select().single();
          userData = newUser;
        }

        setKoin(userData?.koin || 0);
        setIsPro(userData?.is_pro || false);
        setUserWhatsapp(userData?.whatsapp || '');
        setUserNama(userData?.nama || ''); 
        setPremiumProjects(proyekRes.data || []);
        setTransactions(transRes.data || []); 
        setNotifications(notifRes.data || []); // Menyimpan data notifikasi ke state

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

  const syncPendingData = async (uid: string) => {
    const pendingJudul = localStorage.getItem('maululus_pending_judul');
    const pendingOutline = localStorage.getItem('maululus_pending_outline');
    
    if (pendingJudul && pendingOutline) {
      try {
        const parsedOutline = JSON.parse(pendingOutline);
        const { data: checkExist } = await supabase.from('history_skripsi').select('id').eq('user_id', uid).eq('judul', pendingJudul).maybeSingle();
        
        if (!checkExist) {
          await supabase.from('history_skripsi').insert({ user_id: uid, judul: pendingJudul, outline: parsedOutline, is_unlocked: false });
        }
      } catch (e) {
        console.error("Format data outline di localStorage tidak valid", e);
      } finally {
        ['maululus_pending_judul', 'maululus_pending_outline', 'maululus_history'].forEach(key => localStorage.removeItem(key));
      }
    }
  };

  const handleLogoutClick = () => setShowLogoutModal(true);
  const confirmLogout = async () => { await supabase.auth.signOut(); router.replace('/auth'); };

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

  const handleSaveProfile = async (newName: string, newWhatsapp: string) => {
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.from('users_data').update({ nama: newName, whatsapp: newWhatsapp }).eq('id', userId);
      if (error) throw error;
      
      setUserNama(newName);
      setUserWhatsapp(newWhatsapp);
      alert('Profil berhasil diperbarui!');
    } catch (err) {
      alert('Gagal memperbarui profil. Pastikan kolom "nama" tipe text sudah ditambahkan di tabel users_data Supabase Anda.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const displayNama = userNama 
    ? (userNama.charAt(0).toUpperCase() + userNama.slice(1)) 
    : (userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1));

  if (isLoading) return (
    <div className="h-[100dvh] w-full bg-[#F4F7FE] flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#3b82f6]"></div>
    </div>
  );

  return (
    <div className="flex h-full w-full bg-[#F4F7FE] font-sans text-slate-800 overflow-hidden relative">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} activeMenu={activeMenu} setActiveMenu={setActiveMenu} userName={displayNama} isPro={isPro} handleLogout={handleLogoutClick} />
      
      <CenterContent 
        activeMenu={activeMenu} setActiveMenu={setActiveMenu} setIsSidebarOpen={setIsSidebarOpen} 
        userName={displayNama} userEmail={userEmail} userWhatsapp={userWhatsapp} userNama={userNama}
        koin={koin} riwayatList={riwayatList} premiumProjects={premiumProjects} transactions={transactions}
        notifications={notifications} // MENGIRIM DATA NOTIFIKASI KE CENTER CONTENT
        handleBukaKunci={handleBukaKunci} handleSaveProfile={handleSaveProfile}
        isProcessing={isProcessing} isSavingProfile={isSavingProfile} router={router} 
      />
      
      <RightPanel activeMenu={activeMenu} setActiveMenu={setActiveMenu} koin={koin} isPro={isPro} />

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center relative">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">Yakin ingin keluar?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">Sesi Anda saat ini akan diakhiri dan Anda harus masuk kembali untuk mengakses dashboard.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3.5 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
              <button onClick={confirmLogout} className="flex-1 py-3.5 px-4 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/30">Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}