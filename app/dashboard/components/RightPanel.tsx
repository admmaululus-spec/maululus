'use client';
import React from 'react';
import Link from 'next/link';
import { CoinPackage } from './IconsAndUI';

export default function RightPanel({ activeMenu, koin, isPro }: any) {
  return (
    <aside className="hidden 2xl:block w-[340px] bg-white border-l border-slate-200 flex-col h-full overflow-y-auto custom-scrollbar shrink-0">
      <div className="p-6 space-y-8">
        {activeMenu === 'dashboard' && (
          <div className="animate-in fade-in duration-500 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">Saldo Koin Anda</h3>
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-900/20">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-full text-amber-300 text-xl backdrop-blur-sm shadow-inner">🪙</div>
                    <span className="text-3xl font-black">{koin} <span className="text-sm font-medium text-blue-200">Koin</span></span>
                 </div>
                 <Link href="/dashboard/upgrade" className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 border border-white/20 py-2.5 rounded-xl text-sm font-bold transition-all">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                   Top Up Koin
                 </Link>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-3">
                <h3 className="text-sm font-bold text-slate-800">Pilih Paket Koin</h3>
                <Link href="/dashboard/upgrade" className="text-[10px] text-blue-600 font-bold hover:underline">Lihat Semua Paket →</Link>
              </div>
              <div className="space-y-2">
                 <CoinPackage koin="100 Koin" price="Rp49.000" />
                 <CoinPackage koin="250 Koin" price="Rp99.000" isBest />
                 <CoinPackage koin="600 Koin" price="Rp199.000" />
                 <CoinPackage koin="1.400 Koin" price="Rp399.000" />
                 <CoinPackage koin="2.500 Koin" price="Rp699.000" />
              </div>
            </div>

            <div className="bg-[#0B1525] rounded-2xl p-5 relative overflow-hidden text-center">
               <h4 className="text-sm font-bold text-white mb-2 relative z-10">Butuh bantuan lebih personal?</h4>
               <p className="text-[10px] text-slate-400 mb-4 relative z-10">Tingkatkan ke Expert Assistance dan didampingi expert berpengalaman.</p>
               <button className="bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-bold py-2 px-4 rounded-xl relative z-10 shadow-lg shadow-amber-500/30 transition-colors w-full">Lihat Layanan Premium</button>
               <div className="absolute -bottom-6 -right-6 text-7xl opacity-20">🏆</div>
            </div>
          </div>
        )}

        {activeMenu === 'pengaturan' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <h3 className="text-sm font-bold text-slate-800">Status Langganan</h3>
            <div className="bg-[#0D1C2E] border border-[#1a3556] rounded-2xl p-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Paket Saat Ini</p>
              <p className={`text-xl font-black mb-6 ${isPro ? 'text-emerald-400' : 'text-white'}`}>{isPro ? 'PRO PLAN' : 'BASIC FREE'}</p>
              <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo Tersedia</p>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">🪙</span>
                  <span className="text-2xl font-black text-white">{koin} <span className="text-sm font-medium text-slate-400">Koin</span></span>
                </div>
              </div>
              <Link href="/dashboard/upgrade" className="block text-center w-full bg-white text-[#0D1C2E] py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
                Top Up Koin
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}