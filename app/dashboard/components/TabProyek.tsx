'use client';
import React from 'react';
import Link from 'next/link';

export default function TabProyek({ activeProject }: any) {
  // Mengecek ketersediaan data checklist dari Supabase
  const checklist = activeProject?.checklist || [];
  const isWaitingAdmin = checklist.length === 0;

  return (
    <div className="animate-in fade-in max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]"></span>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Proyek Premium Assistance</h2>
      </div>
      
      {activeProject ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
           {/* Fix Tailwind warning: bg-gradient-to-br menjadi bg-linear-to-br */}
           <div className="border border-slate-100 rounded-2xl p-6 md:p-8 relative overflow-hidden bg-linear-to-br from-slate-50 to-white">
             {activeProject.progress === 100 ? (
               <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-widest uppercase flex items-center gap-1">
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> SELESAI
               </div>
             ) : (
               <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-widest uppercase">AKTIF</div>
             )}

             <h3 className="text-xl font-black text-slate-900 mb-2 max-w-[85%]">{activeProject.judul}</h3>
             <p className="text-sm text-slate-500 mb-8 font-medium">Paket <span className="text-indigo-600 font-bold">{activeProject.paket}</span> • Dikerjakan oleh <span className="text-indigo-600 font-bold">{activeProject.expert}</span></p>
             
             {/* Progress Bar Keseluruhan Interaktif */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-slate-800 uppercase tracking-widest">Progress Pengerjaan</span>
                  <span className={`text-2xl font-black ${activeProject.progress === 100 ? 'text-emerald-500' : 'text-blue-600'}`}>{activeProject.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                   <div className={`h-4 rounded-full transition-all duration-1000 ease-out relative ${activeProject.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${activeProject.progress || 0}%` }}>
                     {/* Efek Shine pada Progress Bar */}
                     <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20" style={{ transform: 'skewX(-20deg)', width: '20px', animation: 'shine 2s infinite' }}></div>
                   </div>
                </div>
             </div>

             {/* Dynamic Checklist Render (Timeline Style) */}
             <div className="mt-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Tahapan Pengerjaan Proyek</h4>
                
                {isWaitingAdmin ? (
                  <div className="p-10 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-center flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-slate-300 mb-4 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                    <p className="text-base font-bold text-slate-700 mb-1">Menunggu Analisis Admin</p>
                    <p className="text-sm text-slate-500 max-w-sm">Admin kami sedang mempelajari data skripsi kamu dan menyiapkan kerangka/timeline pengerjaan (Bab, Olah Data, Revisi, dll).</p>
                  </div>
                ) : (
                  <div className="space-y-0 relative pl-4 sm:pl-0">
                    {/* Garis vertikal background untuk timeline */}
                    <div className="absolute left-[1.3rem] sm:left-[2.1rem] top-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>

                    {checklist.map((item: any, idx: number) => {
                      // Menentukan apakah task ini "sedang dikerjakan" (task pertama yang belum selesai)
                      const isCurrentTask = !item.completed && (idx === 0 || checklist[idx - 1].completed);
                      
                      return (
                        <div key={idx} className="relative z-10 flex items-start gap-4 sm:gap-6 py-4">
                          
                          {/* Indikator Timeline */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 shadow-sm transition-all duration-500 bg-white ${
                            item.completed ? 'border-emerald-500 text-emerald-500' : 
                            isCurrentTask ? 'border-blue-500 text-blue-500 animate-pulse' : 
                            'border-slate-200 text-slate-300'
                          }`}>
                            {item.completed ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            ) : isCurrentTask ? (
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                            ) : (
                              <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
                            )}
                          </div>

                          {/* Kartu Konten */}
                          <div className={`flex-1 p-5 rounded-2xl border transition-all duration-300 ${
                            item.completed ? 'bg-emerald-50/50 border-emerald-100 shadow-sm' : 
                            isCurrentTask ? 'bg-white border-blue-200 shadow-md transform scale-[1.01]' : 
                            'bg-slate-50/50 border-slate-100 opacity-75'
                          }`}>
                            <p className={`text-base font-bold mb-1 ${item.completed ? 'text-emerald-800' : isCurrentTask ? 'text-blue-800' : 'text-slate-600'}`}>
                              {item.task}
                            </p>
                            <p className={`text-[11px] uppercase font-bold tracking-widest ${item.completed ? 'text-emerald-600' : isCurrentTask ? 'text-blue-600' : 'text-slate-400'}`}>
                              {item.completed ? '✔ Telah Diselesaikan' : isCurrentTask ? '🔄 Sedang Dikerjakan' : '⏳ Menunggu Giliran'}
                            </p>
                          </div>
                          
                        </div>
                      )
                    })}
                  </div>
                )}
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

      {/* Fix Typescript: dangerouslySetAttribute -> dangerouslySetInnerHTML */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shine {
          0% { left: -30%; opacity: 0; }
          50% { opacity: 0.5; }
          100% { left: 130%; opacity: 0; }
        }
      `}} />
    </div>
  );
}