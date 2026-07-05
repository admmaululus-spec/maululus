'use client';
import React from 'react';

export default function TabPengaturan({ userName, userEmail, userWhatsapp }: any) {
  return (
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
  );
}