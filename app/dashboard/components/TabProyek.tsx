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
        <span className="w-3 h-3 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Proyek Premium Assistance</h2>
      </div>
      
      {activeProject ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
           <div className="border border-slate-100 rounded-2xl p-6 relative overflow-hidden bg-slate-50/50">
             <div className="absolute top-4 right-4 bg-[#00D084] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm tracking-widest">AKTIF</div>
             <h3 className="text-lg font-bold text-slate-900 mb-1 max-w-[85%]">{activeProject.judul}</h3>
             <p className="text-xs text-slate-500 mb-8 font-medium">Paket: {activeProject.paket} • Dikerjakan oleh {activeProject.expert}</p>
             
             {/* Progress Bar Keseluruhan */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-slate-800">Progress Keseluruhan</span>
                  <span className="text-sm font-bold text-blue-600">{activeProject.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                   <div className="bg-[#2563EB] h-3 rounded-full transition-all duration-1000 ease-in-out" style={{ width: `${activeProject.progress || 0}%` }}></div>
                </div>
             </div>

             {/* Dynamic Checklist Render */}
             <div className="mt-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Daftar Pengerjaan</h4>
                
                {isWaitingAdmin ? (
                  <div className="p-8 border border-dashed border-slate-300 rounded-2xl bg-white text-center flex flex-col items-center justify-center">
                    <svg className="w-10 h-10 text-slate-300 mb-3 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                    <p className="text-sm font-bold text-slate-700">Pemrosesan oleh admin Maululus</p>
                    <p className="text-xs text-slate-500 mt-1">Admin sedang menyiapkan struktur pengerjaan (Bab, Revisi, dll) untuk proyek kamu.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {checklist.map((item: any, idx: number) => (
                      <div key={idx} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${item.completed ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${item.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 border border-slate-300'}`}>
                          {item.completed && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${item.completed ? 'text-emerald-800' : 'text-slate-700'}`}>{item.task}</p>
                          <p className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${item.completed ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {item.completed ? '✔ Selesai' : '⏳ Menunggu'}
                          </p>
                        </div>
                      </div>
                    ))}
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
    </div>
  );
}