'use client';
import React from 'react';
import Link from 'next/link';
import { DocumentIcon } from './IconsAndUI';

export default function TabDokumen({ dokumenList, router, handleBukaKunci, isProcessing }: any) {
  return (
    <div className="animate-in fade-in max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><DocumentIcon /></span>
        <h2 className="text-2xl font-extrabold text-slate-800">Dokumen Skripsi AI</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {dokumenList.length > 0 ? dokumenList.map((item: any) => (
          <div key={item.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-blue-300 transition-colors flex flex-col justify-between">
             <div>
               <div className="flex items-center justify-between mb-3">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                 <span className={`text-[9px] font-bold px-2 py-1 rounded ${item.is_unlocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{item.is_unlocked ? 'TERBUKA' : 'TERKUNCI'}</span>
               </div>
               <h3 className="font-bold text-slate-800 text-sm leading-snug mb-4">{item.judul}</h3>
             </div>
             
             {item.is_unlocked ? (
               <button 
                 onClick={() => router.push(`/dashboard/dokumen?id=${item.id}`)} 
                 className="w-full bg-blue-50/50 border border-blue-200 text-blue-700 py-3 rounded-xl text-xs font-extrabold hover:bg-blue-100 transition-colors flex justify-center items-center gap-2"
               >
                 📄 Buka Dokumen
               </button>
             ) : (
               <button 
                 onClick={() => handleBukaKunci(item.id)} 
                 disabled={isProcessing === item.id} 
                 className="w-full bg-amber-500 text-white py-3 rounded-xl text-xs font-extrabold hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
               >
                 🔒 Buka Kunci (-1 Koin)
               </button>
             )}
          </div>
        )) : (
          <div className="col-span-full py-16 bg-white border border-slate-200 border-dashed rounded-3xl text-center">
            <p className="text-slate-500 text-sm mb-4">Anda belum memiliki dokumen hasil AI.</p>
            <Link href="/generator" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700">Buat Skripsi Baru</Link>
          </div>
        )}
      </div>
    </div>
  );
}