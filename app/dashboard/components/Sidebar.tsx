'use client';
import React from 'react';
import { HomeIcon, SparklesIcon, AcademicCapIcon, FolderIcon, DocumentIcon, BookOpenIcon, CoinIcon, WalletIcon, ReceiptIcon, BellIcon, QuestionMarkCircleIcon, CogIcon } from './IconsAndUI';

function NavItem({ id, icon, label, activeMenu, onClick, badge, badgeColor = "bg-blue-500" }: any) {
  const isActive = activeMenu === id;
  return (
    <button 
      onClick={() => onClick(id)}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-900/50' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
      <div className="flex items-center gap-3">
        <span className="w-5 h-5">{icon}</span>
        {label}
      </div>
      {badge && <span className={`${badgeColor} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full`}>{badge}</span>}
    </button>
  );
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, activeMenu, setActiveMenu, userName, isPro, handleLogout }: any) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B1525] text-white flex flex-col transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static transition-transform duration-300 ease-in-out`}>
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white"><path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c1.68 0 3.282.515 4.75 1.407a.75.75 0 001-.707V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" /></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">Maululus</h1>
            <p className="text-[10px] text-slate-400">Academic Platform</p>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        <NavItem id="dashboard" icon={<HomeIcon />} label="Dashboard" activeMenu={activeMenu} onClick={setActiveMenu} />
        <NavItem id="ai-tools" icon={<SparklesIcon />} label="AI Tools" activeMenu={activeMenu} onClick={setActiveMenu} badge="NEW" />
        <NavItem id="expert" icon={<AcademicCapIcon />} label="Expert Assistance" activeMenu={activeMenu} onClick={setActiveMenu} />
        <NavItem id="proyek" icon={<FolderIcon />} label="Proyek Saya" activeMenu={activeMenu} onClick={setActiveMenu} />
        <NavItem id="dokumen" icon={<DocumentIcon />} label="Dokumen Saya" activeMenu={activeMenu} onClick={setActiveMenu} />
        <NavItem id="jurnal" icon={<BookOpenIcon />} label="Jurnal & Referensi" activeMenu={activeMenu} onClick={setActiveMenu} />
        <div className="my-4 border-t border-white/10 pt-4"></div>
        <NavItem id="koin" icon={<CoinIcon />} label="Saldo Koin" activeMenu={activeMenu} onClick={setActiveMenu} />
        <NavItem id="topup" icon={<WalletIcon />} label="Top Up Koin" activeMenu={activeMenu} onClick={setActiveMenu} />
        <NavItem id="transaksi" icon={<ReceiptIcon />} label="Transaksi" activeMenu={activeMenu} onClick={setActiveMenu} />
        <div className="my-4 border-t border-white/10 pt-4"></div>
        <NavItem id="notifikasi" icon={<BellIcon />} label="Notifikasi" activeMenu={activeMenu} onClick={setActiveMenu} badge="3" badgeColor="bg-red-500" />
        <NavItem id="bantuan" icon={<QuestionMarkCircleIcon />} label="Bantuan" activeMenu={activeMenu} onClick={setActiveMenu} />
        <NavItem id="pengaturan" icon={<CogIcon />} label="Pengaturan" activeMenu={activeMenu} onClick={setActiveMenu} />
      </div>

      <div className="p-4 border-t border-white/10 space-y-4">
        <div className="bg-[#152336] rounded-2xl p-4 relative overflow-hidden">
           <h4 className="text-xs font-bold mb-1">Gunakan AI, Hemat Waktu</h4>
           <p className="text-[10px] text-slate-400 mb-3 w-2/3">Dapatkan draft berkualitas dalam hitungan detik dengan AI Maululus.</p>
           {/* Perbaikan pada onClick tombol di bawah ini */}
           <button onClick={() => setActiveMenu('ai-tools')} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors">Coba AI Sekarang</button>
           <div className="absolute -bottom-2 -right-2 opacity-50">🤖</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold uppercase shrink-0">{userName.charAt(0)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">Mahasiswa</p>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}