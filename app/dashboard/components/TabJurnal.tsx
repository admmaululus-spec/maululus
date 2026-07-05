'use client';
import React from 'react';
import { BookOpenIcon } from './IconsAndUI';

export default function TabJurnal({ jurnalRefList, router, setActiveMenu }: any) {
  return (
    <div className="animate-in fade-in max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><BookOpenIcon /></span>
        <h2 className="text-2xl font-extrabold text-slate-800">Jurnal & Referensi AI</h2>
      </div>
      <div className="space-y-4">
        {jurnalRefList.length > 0 ? jurnalRefList.map((item: any) => (
          <div key={item.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-blue-300 transition-colors">
             <div className="flex items-start justify-between">
               <div>
                 <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded mb-2">{item.tool_name}</span>
                 <p className="text-sm font-bold text-slate-800 mb-1">{item.input_data ? item.input_data.substring(0, 80) + '...' : 'Data Referensi'}</p>
                 <p className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleString('id-ID')}</p>
               </div>
               <button onClick={() => router.push(`/dashboard/${item.tool_name.toLowerCase().replace(' ', '-')}`)} className="text-xs bg-white border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl hover:bg-slate-50">Buka Tool</button>
             </div>
          </div>
        )) : (
          <div className="py-16 bg-white border border-slate-200 border-dashed rounded-3xl text-center">
            <p className="text-slate-500 text-sm mb-4">Riwayat pencarian jurnal Anda masih kosong.</p>
            <button onClick={() => setActiveMenu('ai-tools')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700">Buka AI Tools</button>
          </div>
        )}
      </div>
    </div>
  );
}