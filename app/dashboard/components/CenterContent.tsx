'use client';
import React from 'react';
import Link from 'next/link';
import { BellIcon, SparklesIcon, AcademicCapIcon, ToolItem, PackageItem, FeatureIcon } from './IconsAndUI';

export default function CenterContent({ activeMenu, setIsSidebarOpen, userName, userEmail, userWhatsapp, koin, riwayatList, handleBukaKunci, isProcessing, router }: any) {
  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      {/* HEADER ATAS */}
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

      {/* AREA SCROLL KONTEN */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        
        {/* ================= 1. KONTEN DASHBOARD ================= */}
        {activeMenu === 'dashboard' && (
          <div className="animate-in fade-in space-y-6 max-w-5xl mx-auto">
            
            {/* ROW 1: AI Tools & Premium Assistance */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* Box AI Tools */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="flex items-center gap-2 font-bold text-[#4F46E5] text-sm">
                    <SparklesIcon /> AI TOOLS <span className="text-slate-500 text-xs font-normal">(Gunakan Koin)</span>
                  </h3>
                  <button onClick={() => document.getElementById('ai-tools')?.click()} className="text-xs text-blue-600 font-semibold hover:underline">
                    Lihat Semua Tools →
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <ToolItem href="/generator" icon="🎯" label="Buat Judul" isFree color="text-green-500" bg="bg-green-50" />
                  <ToolItem href="/dashboard/copilot" icon="✍️" label="AI Draft Writer" coin={15} isHot color="text-blue-500" bg="bg-blue-50" />
                  <ToolItem href="/dashboard/parafrase" icon="🔄" label="Parafrase" coin={15} color="text-indigo-500" bg="bg-indigo-50" />
                  <ToolItem href="/dashboard/academic-style" icon="🎓" label="Academic Style" coin={2} color="text-teal-500" bg="bg-teal-50" />
                </div>
                
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex gap-3 items-start mt-4">
                  <span className="text-blue-500">ℹ️</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed">AI Tools memberikan draft instan. Hasil dapat diedit dan dikembangkan sendiri. Untuk hasil yang lebih mendalam dan terarah, gunakan layanan Expert Assistance.</p>
                </div>
              </div>

              {/* Box Premium Assistance */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="flex items-center gap-2 font-bold text-emerald-600 text-sm">
                    <AcademicCapIcon /> PREMIUM ASSISTANCE <span className="text-slate-500 text-xs font-normal">(Dikerjakan Expert)</span>
                  </h3>
                  <button className="text-xs text-emerald-600 font-semibold hover:underline">Lihat Semua Paket →</button>
                </div>
                
                <div className="space-y-3 flex-1">
                  <PackageItem title="Paket Proposal (Sempro)" desc="Judul + Bab 1-3 + Mendeley + Revisi" price="Rp1.850.000" icon="📝" />
                  <PackageItem title="Paket Semhas" desc="Bab 4-5 + Olah Data + Abstrak + PPT + Revisi" price="Rp4.200.000" icon="📊" />
                  <PackageItem title="Paket Complete (Full Bab)" desc="Bab 1-5 + Olah Data + Mendeley + PPT + Revisi" price="Rp6.200.000" icon="🎓" isComplete />
                </div>
                
                <div className="grid grid-cols-4 gap-2 mt-5 text-center">
                   <FeatureIcon icon="🧑‍🏫" label="Dikerjakan Expert" />
                   <FeatureIcon icon="🔄" label="Revisi Terstruktur" />
                   <FeatureIcon icon="📈" label="Progress Tracking" />
                   <FeatureIcon icon="💬" label="Chat dengan Admin" />
                </div>
              </div>
            </div>

            {/* ROW 2: Proyek Saya & Aktivitas Terbaru */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
               
               {/* Proyek Saya */}
               <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-slate-800 text-sm">Proyek Saya</h3>
                   <button className="text-xs text-blue-600 font-semibold hover:underline">Lihat Semua →</button>
                 </div>
                 
                 <div className="flex gap-4">
                   <div className="w-1/2">
                     <div className="flex items-start gap-3 mb-4">
                       <div className="bg-[#4F46E5] text-white p-2 rounded-lg text-lg">📄</div>
                       <div>
                         <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Skripsi</p>
                         <p className="text-sm font-bold text-slate-800 leading-snug mt-1">Analisis Pengaruh Kualitas Pelayanan terhadap Kepuasan Pelanggan</p>
                       </div>
                     </div>
                     <table className="w-full text-xs text-slate-600">
                       <tbody>
                         <tr><td className="py-1">Layanan</td><td className="font-semibold text-emerald-600">Expert Assistance</td></tr>
                         <tr><td className="py-1">Paket</td><td className="font-semibold">Complete (Full Bab)</td></tr>
                         <tr><td className="py-1">Bidang</td><td className="font-semibold">Manajemen</td></tr>
                       </tbody>
                     </table>
                   </div>
                   
                   <div className="w-1/2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <div className="flex justify-between items-end mb-2">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progress</p>
                       <p className="text-[10px] text-blue-500">Sedang dikerjakan</p>
                     </div>
                     <p className="text-2xl font-black text-slate-800 mb-3">65%</p>
                     <div className="w-full bg-slate-200 rounded-full h-1.5 mb-4">
                       <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                     </div>
                     <ul className="space-y-2 text-xs">
                       <li className="flex justify-between items-center text-emerald-600"><span className="flex items-center gap-1"><span className="text-[10px]">✔</span> Bab 1 & 2</span> <span className="text-[10px]">Selesai</span></li>
                       <li className="flex justify-between items-center text-blue-600 font-bold"><span className="flex items-center gap-1">◎ Bab 3</span> <span className="text-[10px]">Diproses</span></li>
                     </ul>
                   </div>
                 </div>
               </div>

               {/* Aktivitas Terbaru (Kombinasi Skripsi & AI Tools History) */}
               <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-slate-800 text-sm">Aktivitas Terbaru</h3>
                   <button className="text-xs text-blue-600 font-semibold hover:underline">Lihat Semua →</button>
                 </div>
                 <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                   {riwayatList.length > 0 ? riwayatList.slice(0, 4).map((item: any) => {
                     // Identifikasi apakah ini dari ai_tools_history atau history_skripsi
                     const isAiTool = !!item.tool_name;
                     const displayTitle = isAiTool ? `${item.tool_name}` : (item.judul ? item.judul.substring(0, 40) + '...' : 'Dokumen');
                     const displayDesc = isAiTool 
                       ? (item.input_data ? item.input_data.substring(0, 35) + '...' : new Date(item.created_at).toLocaleDateString('id-ID')) 
                       : new Date(item.created_at).toLocaleDateString('id-ID');
                       
                     const toolIcon = item.tool_name === 'Parafrase' ? '🔄' : item.tool_name === 'Sitasi' ? '📑' : item.tool_name === 'Turnitin' ? '🛡️' : item.tool_name === 'Cari Jurnal' ? '🔍' : '📄';

                     return (
                       <div key={item.id} className="flex items-start justify-between">
                         <div className="flex items-start gap-3">
                           <div className={`p-2 rounded-lg text-sm mt-0.5 ${isAiTool ? 'bg-indigo-50 text-indigo-500' : 'bg-emerald-50 text-emerald-500'}`}>
                             {isAiTool ? toolIcon : '📄'}
                           </div>
                           <div>
                             <p className="text-sm font-bold text-slate-800">{displayTitle}</p>
                             <p className="text-[10px] text-slate-500">{displayDesc}</p>
                             
                             {isAiTool ? (
                               <button className="text-[10px] text-indigo-600 font-semibold mt-1">Lihat Riwayat</button>
                             ) : item.is_unlocked ? (
                               <button onClick={() => router.push(`/dashboard/dokumen?id=${item.id}`)} className="text-[10px] text-blue-600 font-semibold mt-1">Buka Dokumen</button>
                             ) : (
                               <button onClick={() => handleBukaKunci(item.id)} disabled={isProcessing === item.id} className="text-[10px] text-amber-600 font-semibold mt-1">
                                 Buka Kunci (-1 Koin)
                               </button>
                             )}
                           </div>
                         </div>
                       </div>
                     )
                   }) : (
                     <p className="text-xs text-slate-400 text-center py-10">Belum ada aktivitas.</p>
                   )}
                 </div>
               </div>
            </div>

            {/* Bottom Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-wrap justify-between items-center gap-4 text-xs font-semibold text-slate-700 shadow-sm">
               <div className="flex items-center gap-3"><div className="bg-blue-100 text-blue-600 p-2 rounded-full text-base">🛡️</div> <div><p>Aman & Terpercaya</p><p className="text-[10px] text-slate-400 font-normal">Data privasi terjamin 100%.</p></div></div>
               <div className="flex items-center gap-3"><div className="bg-blue-100 text-blue-600 p-2 rounded-full text-base">🎓</div> <div><p>Dosen & Expert</p><p className="text-[10px] text-slate-400 font-normal">Expert tersaring profesional.</p></div></div>
               <div className="flex items-center gap-3"><div className="bg-blue-100 text-blue-600 p-2 rounded-full text-base">📊</div> <div><p>Proses Transparan</p><p className="text-[10px] text-slate-400 font-normal">Pantau progress real-time.</p></div></div>
            </div>
            
          </div>
        )}

        {/* ================= 2. KONTEN MENU AI TOOLS ================= */}
        {activeMenu === 'ai-tools' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl mx-auto">
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
              <div className="mb-8 border-b border-slate-100 pb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                    <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><SparklesIcon /></span>
                    Direktori AI Tools
                  </h2>
                  <p className="text-sm text-slate-500 mt-2 max-w-2xl">Pilih asisten AI yang kamu butuhkan untuk mempercepat pengerjaan skripsi. Sistem akan otomatis memotong saldo koin kamu per penggunaan.</p>
                </div>
                <div className="hidden md:flex bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl items-center gap-2">
                  <span className="text-amber-500 text-lg">🪙</span>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Saldo Tersedia</p>
                    <p className="text-sm font-black text-slate-800">{koin} Koin</p>
                  </div>
                </div>
              </div>

              {/* Grid Keseluruhan Menu AI Tools */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                <ToolItem href="/generator" icon="🎯" label="Buat Judul" isFree color="text-green-500" bg="bg-green-50" />
                <ToolItem href="/dashboard/copilot" icon="✍️" label="AI Draft Writer" coin={15} isHot color="text-blue-500" bg="bg-blue-50" />
                <ToolItem href="/dashboard/parafrase" icon="🔄" label="Parafrase" coin={15} color="text-indigo-500" bg="bg-indigo-50" />
                <ToolItem href="/dashboard/academic-style" icon="🎓" label="Academic Style" coin={2} color="text-teal-500" bg="bg-teal-50" />
                
                <ToolItem href="/dashboard/ringkasan-jurnal" icon="📄" label="Ringkasan Jurnal" coin={3} color="text-amber-500" bg="bg-amber-50" />
                <ToolItem href="/dashboard/cari-jurnal" icon="🔍" label="Cari Jurnal" coin={5} color="text-blue-400" bg="bg-blue-50" />
                <ToolItem href="/dashboard/sitasi" icon="📑" label="Generate Sitasi" coin={2} color="text-purple-500" bg="bg-purple-50" />
                <ToolItem href="/dashboard/turnitin" icon="🛡️" label="Turnitin Check" coin={20} color="text-rose-500" bg="bg-rose-50" />
              </div>

              <div className="mt-10 p-5 bg-slate-50 border border-slate-200 border-dashed rounded-2xl flex items-start gap-4">
                 <div className="text-2xl">🤖</div>
                 <div>
                   <h4 className="text-xs font-bold text-slate-800 mb-1">Dukung Risetmu Dengan Google Scholar AI</h4>
                   <p className="text-[11px] text-slate-500 leading-relaxed">Fitur "Cari Jurnal" dan "Generate Sitasi" terintegrasi cerdas untuk menyaring *paper* relevan dan menyusun format penulisan, memangkas waktu riset literatur yang biasa memakan waktu berhari-hari.</p>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. KONTEN PENGATURAN PROFIL ================= */}
        {activeMenu === 'pengaturan' && (
          <div className="animate-in fade-in max-w-2xl mx-auto space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="h-16 w-16 bg-[#0D1C2E] rounded-full flex items-center justify-center text-white text-2xl font-black">{userName.charAt(0)}</div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{userName}</h2>
                  <p className="text-sm text-slate-500 font-medium">Mahasiswa Akhir</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="flex items-center justify-between bg-slate-50 px-5 py-4 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-800 text-sm">{userEmail}</span>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">Terverifikasi</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">WhatsApp</label>
                  <div className="flex items-center bg-slate-50 px-5 py-4 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-800 text-sm">{userWhatsapp}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. PLACEHOLDER UNTUK MENU LAINNYA ================= */}
        {activeMenu !== 'dashboard' && activeMenu !== 'ai-tools' && activeMenu !== 'pengaturan' && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 mb-4 opacity-20"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m11.25 14.25a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9c0-1.242.75-2.25 1.875-2.25h.75m10.5 12.75h-3m-3 0h-3m-3 0H6.75" /></svg>
             <p className="text-sm font-medium">Halaman <span className="capitalize text-slate-600">{activeMenu.replace('-', ' ')}</span> sedang dalam pengembangan.</p>
          </div>
        )}

      </div>
    </main>
  );
}