'use client';
import React from 'react';
import Link from 'next/link';
import { BellIcon } from './IconsAndUI';
import TabDashboard from './TabDashboard';
import TabProyek from './TabProyek';
import { TabAiTools, TabDokumen, TabJurnal, TabPengaturan, TabExpert } from './OtherTabs';
import { TabKoin, TabTopup } from './BillingTabs';

export default function CenterContent({ activeMenu, setActiveMenu, setIsSidebarOpen, userName, userEmail, userWhatsapp, koin, riwayatList, premiumProjects, handleBukaKunci, isProcessing, router }: any) {
  
  const dokumenList = riwayatList.filter((item: any) => !item.tool_name);
  const jurnalRefList = riwayatList.filter((item: any) => item.tool_name);
  const activeProject = premiumProjects && premiumProjects.length > 0 ? premiumProjects[0] : null;

  const validMenus = ['dashboard', 'proyek', 'ai-tools', 'dokumen', 'jurnal', 'pengaturan', 'expert', 'koin', 'topup'];

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Halo, {userName}! 👋</h2>
            <p className="text-xs text-slate-500 mt-0.5">Semangat selesaikan skripsimu hari ini!</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/upgrade" className="hidden md:flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-full cursor-pointer hover:bg-amber-100 transition-colors">
            <span className="text-amber-500 text-lg">🪙</span>
            <span className="text-sm font-bold text-slate-800">{koin} Koin</span>
          </Link>
          <button className="relative text-slate-400 hover:text-slate-600">
            <BellIcon />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <div className="hidden md:flex items-center gap-2 ml-2 pl-4 border-l border-slate-200">
             <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">{userName.charAt(0)}</div>
             <span className="text-sm font-semibold text-slate-700">{userName}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F8FAFC]">
        {activeMenu === 'dashboard' && <TabDashboard riwayatList={riwayatList} activeProject={activeProject} router={router} handleBukaKunci={handleBukaKunci} isProcessing={isProcessing} setActiveMenu={setActiveMenu} />}
        {activeMenu === 'proyek' && <TabProyek activeProject={activeProject} />}
        {activeMenu === 'expert' && <TabExpert />}
        {activeMenu === 'ai-tools' && <TabAiTools koin={koin} />}
        {activeMenu === 'dokumen' && <TabDokumen dokumenList={dokumenList} router={router} handleBukaKunci={handleBukaKunci} isProcessing={isProcessing} />}
        {activeMenu === 'jurnal' && <TabJurnal jurnalRefList={jurnalRefList} router={router} setActiveMenu={setActiveMenu} />}
        {activeMenu === 'koin' && <TabKoin koin={koin} riwayatList={riwayatList} setActiveMenu={setActiveMenu} />}
        {activeMenu === 'topup' && <TabTopup koin={koin} />}
        {activeMenu === 'pengaturan' && <TabPengaturan userName={userName} userEmail={userEmail} userWhatsapp={userWhatsapp} />}
        
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