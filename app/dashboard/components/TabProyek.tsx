'use client';
import React from 'react';
import Link from 'next/link';
import { FolderIcon } from './IconsAndUI';

export default function TabProyek({ activeProject }: any) {
  const renderStatusBox = (title: string, status: string) => {
    if (status === 'SELESAI') {
      return (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 text-center flex flex-col items-center justify-center">
          <p className="text-xs font-bold mb-1.5">{title}</p>
          <p className="text-[10px] uppercase font-bold flex items-center gap-1">✔ SELESAI</p>
        </div>
      );
    }
    if (status === 'DIPROSES') {
      return (
        <div className="p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 text-center flex flex-col items-center justify-center">
          <p className="text-xs font-bold mb-1.5">{title}</p>
          <p className="text-[10px] uppercase font-bold flex items-center gap-1 animate-pulse">⚙️ SEDANG DIKERJAKAN</p>
        </div>
      );
    }
    return (
      <div className="p-4 bg-slate-50 text-slate-500 rounded-xl border border-slate-100 text-center flex flex-col items-center justify-center">
        <p className="text-xs font-bold mb-1.5">{title}</p>
        <p className="text-[10px] uppercase font-bold">MENUNGGU</p>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-3 h-3 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Proyek Premium Assistance</h2>
      </div>
      
      {activeProject ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
           <div className="border border-slate-100 rounded-2xl p-6 relative overflow-hidden bg-slate-50/50">
             <div className="absolute top-4 right-4 bg-[#00D084] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm tracking-widest">AKTIF</div>
             <h3 className="text-lg font-bold text-slate-900 mb-1 max-w-[85%]">{activeProject.judul}</h3>
             <p className="text-xs text-slate-500 mb-8 font-medium">Paket: {activeProject.paket} • Dikerjakan oleh {activeProject.expert}</p>
             
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-slate-800">Progress Pengerjaan</span>
                  <span className="text-sm font-bold text-blue-600">{activeProject.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                   <div className="bg-[#2563EB] h-3 rounded-full transition-all duration-1000 ease-in-out" style={{ width: `${activeProject.progress}%` }}></div>
                </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {renderStatusBox('Bab 1 & 2', activeProject.status_bab12)}
                {renderStatusBox('Bab 3', activeProject.status_bab3)}
                {renderStatusBox('Bab 4 & 5', activeProject.status_bab45)}
                {renderStatusBox('Revisi & PPT', activeProject.status_revisi)}
             </div>
           </div>
        </div>
      ) : (
        <div className="py-20 bg-white border border-slate-200 border-dashed rounded-3xl text-center flex flex-col items-center">
          <div className="text-5xl mb-4 grayscale opacity-50">🎓</div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Kamu belum memiliki Proyek Premium</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md">Dapatkan pendampingan langsung dari Expert untuk menyelesaikan skripsimu dari awal hingga akhir, termasuk revisi dan olah data.</p>
          <Link href="/dashboard/upgrade" className="bg-amber-500 text-amber-950 px-6 py-3 rounded-xl text-sm font-bold hover:bg-amber-400 shadow-md">Lihat Pilihan Paket</Link>
        </div>
      )}
    </div>
  );
}