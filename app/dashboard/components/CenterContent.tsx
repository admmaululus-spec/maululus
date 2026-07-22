// app/dashboard/components/CenterContent.tsx
'use client';
import React from 'react';
import { BellIcon } from './IconsAndUI';
import TabDashboard from './TabDashboard';
import TabProyek from './TabProyek';
import TabAiTools from './TabAiTools';
import TabDokumen from './TabDokumen';
import TabJurnal from './TabJurnal';
import TabExpert from './TabExpert';
import { TabKoin, TabTopup } from './BillingTabs';

// 1. TAMBAHKAN INTERFACE: Agar kode lebih rapi, aman, dan auto-complete berfungsi
interface CenterContentProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  userName: string;
  userEmail: string;
  userWhatsapp: string;
  userNama: string;
  koin: number;
  riwayatList: any[];
  premiumProjects: any[];
  transactions: any[];
  notifications: any[];
  handleBukaKunci: (id: string) => void;
  handleSaveProfile: (nama: string, whatsapp: string) => void;
  isProcessing: string | null;
  isSavingProfile: boolean;
  router: any;
  userId: string | null;
}

export default function CenterContent({ 
  activeMenu, setActiveMenu, setIsSidebarOpen, userName, userEmail, 
  userWhatsapp, userNama, koin, riwayatList, premiumProjects, transactions, 
  notifications, handleBukaKunci, handleSaveProfile, isProcessing, 
  isSavingProfile, router, userId 
}: CenterContentProps) {
  
  // 2. NULL-SAFETY: Tambahkan fallback (|| []) agar tidak crash saat array masih kosong/undefined
  const safeRiwayatList = riwayatList || [];
  const dokumenList = safeRiwayatList.filter((item: any) => !item.tool_name);
  const jurnalRefList = safeRiwayatList.filter((item: any) => item.tool_name);
  const activeProject = premiumProjects?.length > 0 ? premiumProjects[0] : null;

  const validMenus = ['dashboard', 'proyek', 'ai-tools', 'dokumen', 'jurnal', 'pengaturan', 'expert', 'koin', 'topup', 'transaksi', 'notifikasi', 'bantuan'];

  // Hitung berapa banyak notifikasi yang belum dibaca dengan optional chaining (?.)
  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;
  
  // Ambil inisial nama dengan aman
  const initial = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="lg:hidden text-slate-500"
            aria-label="Buka Menu Navigasi"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Halo, {userName}! 👋</h2>
            <p className="text-xs text-slate-500 mt-0.5">Semangat selesaikan skripsimu hari ini!</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveMenu('topup')} className="hidden md:flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-full cursor-pointer hover:bg-amber-100 transition-colors">
            <span className="text-amber-500 text-lg">🪙</span>
            <span className="text-sm font-bold text-slate-800">{koin} Koin</span>
          </button>
          
          <button 
            onClick={() => setActiveMenu('notifikasi')} 
            className="relative text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Lihat Notifikasi"
          >
            <BellIcon />
            {unreadCount > 0 && (
               <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500 border-2 border-white rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                 {unreadCount > 99 ? '99+' : unreadCount}
               </span>
            )}
          </button>
          
          <div className="hidden md:flex items-center gap-2 ml-2 pl-4 border-l border-slate-200 cursor-pointer" onClick={() => setActiveMenu('pengaturan')}>
             <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
               {initial}
             </div>
             <span className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">{userName}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F8FAFC]">
        {activeMenu === 'dashboard' && <TabDashboard riwayatList={safeRiwayatList} premiumProjects={premiumProjects} activeProject={activeProject} router={router} handleBukaKunci={handleBukaKunci} isProcessing={isProcessing} setActiveMenu={setActiveMenu} />}
        {activeMenu === 'proyek' && <TabProyek premiumProjects={premiumProjects} activeProject={activeProject} setActiveMenu={setActiveMenu} />}
        {activeMenu === 'expert' && <TabExpert riwayatList={safeRiwayatList} koin={koin} userId={userId} />}
        
        {activeMenu === 'ai-tools' && <TabAiTools koin={koin} userId={userId} />}
        {activeMenu === 'dokumen' && <TabDokumen dokumenList={dokumenList} router={router} handleBukaKunci={handleBukaKunci} isProcessing={isProcessing} />}
        {activeMenu === 'jurnal' && <TabJurnal jurnalRefList={jurnalRefList} router={router} setActiveMenu={setActiveMenu} />}
        {activeMenu === 'koin' && <TabKoin koin={koin} riwayatList={safeRiwayatList} setActiveMenu={setActiveMenu} />}
        {activeMenu === 'topup' && <TabTopup koin={koin} />}
        
        {/* TAB TRANSAKSI */}
        {activeMenu === 'transaksi' && (
          <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-800">Riwayat Transaksi</h2>
              <p className="text-slate-500 text-sm mt-1">Lacak pembelian koin dan layanan expert Anda di sini.</p>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Tanggal</th>
                    <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Paket / Layanan</th>
                    <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Nominal</th>
                    <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Status Koin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions?.length > 0 ? transactions.map((trx: any) => (
                    <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-500">{new Date(trx.created_at).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {trx.paket_nama}
                        <div className="text-[10px] font-normal text-slate-400 mt-0.5">{trx.metode}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">Rp{(trx.harga_rp || 0).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4">
                        <span className={`border px-2.5 py-1 rounded-md text-[10px] font-bold ${trx.koin_jumlah >= 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                          {trx.koin_jumlah >= 0 ? `+${trx.koin_jumlah} Koin` : `${trx.koin_jumlah} Koin`}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Belum ada riwayat transaksi top up.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB PENGATURAN PROFIL */}
        {activeMenu === 'pengaturan' && (
          <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-800">Pengaturan Akun</h2>
              <p className="text-slate-500 text-sm mt-1">Kelola informasi profil dan kontak WhatsApp Anda.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
                <div className="w-20 h-20 bg-[#0B1525] text-white text-3xl font-bold rounded-full flex items-center justify-center uppercase shadow-md shrink-0">
                  {initial}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{userName}</h3>
                  <p className="text-slate-500 text-sm">Mahasiswa Akhir</p>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSaveProfile(formData.get('nama') as string, formData.get('whatsapp') as string);
              }} className="space-y-6">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <input type="email" value={userEmail} disabled className="w-full bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-xl px-4 py-3 opacity-70 cursor-not-allowed" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-md">TERVERIFIKASI</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                  <input type="text" name="nama" defaultValue={userNama} placeholder="Masukkan nama panggilan / lengkap" className="w-full bg-white border border-slate-200 text-slate-800 font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">WhatsApp</label>
                  <input type="tel" name="whatsapp" defaultValue={userWhatsapp} placeholder="Contoh: 08123456789" className="w-full bg-white border border-slate-200 text-slate-800 font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={isSavingProfile} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-70">
                    {isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB NOTIFIKASI */}
        {activeMenu === 'notifikasi' && (
          <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-800">Notifikasi</h2>
              <p className="text-slate-500 text-sm mt-1">Pembaruan sistem dan peringatan akun Anda.</p>
            </div>
            
            <div className="space-y-4">
              {notifications?.length > 0 ? notifications.map((notif: any) => (
                <div key={notif.id} className={`border rounded-2xl p-5 flex gap-4 items-start transition-all ${!notif.is_read ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200'}`}>
                  <div className={`p-2.5 rounded-full shrink-0 text-xl ${!notif.is_read ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}>
                    {notif.icon || '🔔'}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${!notif.is_read ? 'text-blue-900' : 'text-slate-800'}`}>{notif.title}</h4>
                    <p className={`text-sm mt-1 leading-relaxed ${!notif.is_read ? 'text-blue-800/80' : 'text-slate-500'}`}>{notif.message}</p>
                    <span className={`text-[10px] font-bold mt-3 block uppercase tracking-widest ${!notif.is_read ? 'text-blue-500' : 'text-slate-400'}`}>
                      {new Date(notif.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center p-10 border border-slate-200 border-dashed rounded-3xl text-slate-400">
                  <div className="text-4xl mb-3 opacity-50">📭</div>
                  <p>Belum ada notifikasi saat ini.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB BANTUAN */}
        {activeMenu === 'bantuan' && (
          <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-800">Pusat Bantuan</h2>
              <p className="text-slate-500 text-sm mt-1">Punya kendala? Tim kami siap membantu.</p>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hubungi Customer Service</h3>
              <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">Jika Anda mengalami kendala pembayaran, penggunaan AI, atau ingin konsultasi terkait Expert Assistance, silakan hubungi admin kami via WhatsApp.</p>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" /></svg>
                Chat WhatsApp Admin
              </a>
            </div>
          </div>
        )}

        {!validMenus.includes(activeMenu) && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 mb-4 opacity-20"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m11.25 14.25a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9c0-1.242.75-2.25 1.875-2.25h.75m10.5 12.75h-3m-3 0h-3m-3 0H6.75" /></svg>
             <p className="text-sm font-medium">Halaman <span className="capitalize text-slate-600">{activeMenu.replace('-', ' ')}</span> sedang dalam pengembangan.</p>
          </div>
        )}
      </div>
    </main>
  );
}