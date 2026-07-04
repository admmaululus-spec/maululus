'use client';
import React from 'react';
import { 
  SparklesIcon, AcademicCapIcon, ToolItem, PackageItem, FeatureIcon, TargetIcon, PencilIcon, RefreshIcon, FolderIcon, DocumentIcon,
  PresentationIcon, UserTieIcon, ChartLineIcon, ChatBubbleIcon 
} from './IconsAndUI';

export default function TabDashboard({ riwayatList, activeProject, router, handleBukaKunci, isProcessing, setActiveMenu }: any) {
  return (
    <div className="animate-in fade-in space-y-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Box AI Tools */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="flex items-center gap-2 font-bold text-blue-700 text-sm">
              <SparklesIcon /> AI TOOLS <span className="text-slate-500 text-xs font-normal">(Gunakan Koin)</span>
            </h3>
            {/* Perbaikan pada tombol ini */}
            <button onClick={() => setActiveMenu('ai-tools')} className="text-xs text-blue-600 font-semibold hover:underline">Lihat Semua Tools →</button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <ToolItem href="/generator" icon={<TargetIcon />} label="Buat Judul" isFree />
            <ToolItem href="/dashboard/copilot" icon={<PencilIcon />} label="AI Draft Writer" coin={15} isHot />
            <ToolItem href="/dashboard/parafrase" icon={<RefreshIcon />} label="Parafrase" coin={15} />
          </div>
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start mt-4">
            <span className="text-blue-500">ℹ️</span>
            <p className="text-[10px] text-slate-600 leading-relaxed">AI Tools memberikan draft instan. Untuk hasil yang lebih mendalam dan terarah, gunakan layanan Expert Assistance.</p>
          </div>
        </div>

        {/* Box Kondisional: Proyek Berjalan ATAU Promo Premium */}
        {activeProject ? (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-sm">Proyek Berjalan</h3>
              {/* Perbaikan pada tombol ini */}
              <button onClick={() => setActiveMenu('proyek')} className="text-xs text-blue-600 font-semibold hover:underline">Lihat Detail →</button>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-blue-600 text-white p-2 rounded-lg text-lg"><FolderIcon /></div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Premium</p>
                    <p className="text-sm font-bold text-slate-800 leading-snug mt-1">{activeProject.judul.substring(0, 50)}...</p>
                  </div>
                </div>
                <table className="w-full text-xs text-slate-600">
                  <tbody>
                    <tr><td className="py-1">Paket</td><td className="font-semibold text-emerald-600">{activeProject.paket}</td></tr>
                    <tr><td className="py-1">Expert</td><td className="font-semibold">{activeProject.expert}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="w-1/2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progress</p>
                  <p className="text-[10px] text-blue-500">Aktif</p>
                </div>
                <p className="text-2xl font-black text-slate-800 mb-3">{activeProject.progress}%</p>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mb-4">
                  <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${activeProject.progress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h3 className="flex items-center gap-2 font-bold text-emerald-600 text-sm"><AcademicCapIcon /> PREMIUM ASSISTANCE</h3>
            </div>
            <div className="space-y-3 flex-1">
              <PackageItem title="Paket Proposal" desc="Judul + Bab 1-3 + Mendeley + Revisi" price="Rp1.850.000" icon={<DocumentIcon />} />
              <PackageItem title="Paket Semhas" desc="Bab 4-5 + Olah Data + PPT + Revisi" price="Rp4.200.000" icon={<PresentationIcon />} />
              <PackageItem title="Paket Complete" desc="Bab 1-5 + Olah Data + PPT + Revisi" price="Rp6.200.000" icon={<AcademicCapIcon />} isComplete />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-5 text-center">
               <FeatureIcon icon={<UserTieIcon />} label="Dikerjakan Expert" />
               <FeatureIcon icon={<RefreshIcon />} label="Revisi Terstruktur" />
               <FeatureIcon icon={<ChartLineIcon />} label="Progress Tracking" />
               <FeatureIcon icon={<ChatBubbleIcon />} label="Chat Admin" />
            </div>
          </div>
        )}
      </div>
      
      {/* Aktivitas Terbaru */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
         <h3 className="font-bold text-slate-800 text-sm mb-6">Aktivitas AI & Dokumen Terbaru</h3>
         <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
           {riwayatList.length > 0 ? riwayatList.slice(0, 4).map((item: any) => {
             const isAiTool = !!item.tool_name;
             const displayTitle = isAiTool ? `${item.tool_name}` : (item.judul ? item.judul.substring(0, 40) + '...' : 'Dokumen');
             const displayDesc = isAiTool ? (item.input_data ? item.input_data.substring(0, 35) + '...' : new Date(item.created_at).toLocaleDateString('id-ID')) : new Date(item.created_at).toLocaleDateString('id-ID');
             
             return (
               <div key={item.id} className="flex items-start justify-between">
                 <div className="flex items-start gap-3">
                   <div className={`p-2 rounded-lg text-sm mt-0.5 ${isAiTool ? 'bg-indigo-50 text-indigo-500' : 'bg-blue-50 text-blue-500'}`}>
                     {isAiTool ? <SparklesIcon /> : <DocumentIcon />}
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-800">{displayTitle}</p>
                     <p className="text-[10px] text-slate-500">{displayDesc}</p>
                     {!isAiTool && (item.is_unlocked ? (
                       <button onClick={() => router.push(`/dashboard/dokumen?id=${item.id}`)} className="text-[10px] text-blue-600 font-semibold mt-1 hover:underline">Buka Dokumen</button>
                     ) : (
                       <button onClick={() => handleBukaKunci(item.id)} disabled={isProcessing === item.id} className="text-[10px] text-amber-600 font-semibold mt-1">Buka Kunci (-1 Koin)</button>
                     ))}
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
  );
}