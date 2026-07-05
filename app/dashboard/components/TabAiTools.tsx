'use client';
import React from 'react';
import { 
  SparklesIcon, ToolItem, TargetIcon, PencilIcon, RefreshIcon, SummarizeIcon, MagnifyIcon, CitationIcon, ShieldCheckIcon 
} from './IconsAndUI';

export default function TabAiTools({ koin }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
        <div className="mb-8 border-b border-slate-100 pb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
              <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><SparklesIcon /></span>
              Direktori AI Tools
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl">Sistem akan otomatis memotong saldo koin per penggunaan.</p>
          </div>
          <div className="hidden md:flex bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl items-center gap-2">
            <span className="text-amber-500 text-lg">🪙</span>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Saldo Tersedia</p>
              <p className="text-sm font-black text-slate-800">{koin} Koin</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ToolItem href="/generator" icon={<TargetIcon />} label="Buat Judul" isFree />
          <ToolItem href="/dashboard/copilot" icon={<PencilIcon />} label="AI Draft Writer" coin={15} isHot />
          <ToolItem href="/dashboard/parafrase" icon={<RefreshIcon />} label="Parafrase" coin={15} />
          <ToolItem href="/dashboard/ringkasan-jurnal" icon={<SummarizeIcon />} label="Ringkasan Jurnal" coin={3} />
          <ToolItem href="/dashboard/cari-jurnal" icon={<MagnifyIcon />} label="Cari Jurnal" coin={5} />
          <ToolItem href="/dashboard/sitasi" icon={<CitationIcon />} label="Generate Sitasi" coin={2} />
          <ToolItem href="/dashboard/turnitin" icon={<ShieldCheckIcon />} label="Turnitin Check" coin={20} />
        </div>
      </div>
    </div>
  );
}