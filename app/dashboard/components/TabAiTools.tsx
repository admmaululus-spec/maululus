'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { SparklesIcon, ToolItem, TargetIcon, PencilIcon, RefreshIcon, SummarizeIcon, MagnifyIcon, CitationIcon, ShieldCheckIcon } from './IconsAndUI';

export default function TabAiTools({ koin, userId }: any) {
  const router = useRouter();
  const [tools, setTools] = useState<any[]>([]);
  const [isDeducting, setIsDeducting] = useState(false);

  useEffect(() => {
    const fetchTools = async () => {
      const { data } = await supabase.from('ai_tools_pricing').select('*').order('koin', { ascending: true });
      if (data) setTools(data);
    };
    fetchTools();
  }, []);

  const getIcon = (id: string) => {
    switch(id) {
      case 'generator': return <TargetIcon />;
      case 'copilot': return <PencilIcon />;
      case 'parafrase': return <RefreshIcon />;
      case 'ringkasan-jurnal': return <SummarizeIcon />;
      case 'cari-jurnal': return <MagnifyIcon />;
      case 'sitasi': return <CitationIcon />;
      case 'turnitin': return <ShieldCheckIcon />;
      default: return <SparklesIcon />;
    }
  };

  const handleToolClick = async (tool: any) => {
    if (isDeducting) return;
    
    // Jika gratis, langsung masuk
    if (Number(tool.koin) === 0) {
      router.push(`/${tool.id === 'generator' ? 'generator' : 'dashboard/' + tool.id}`);
      return;
    }
    
    // Validasi saldo koin
    if (Number(koin) < Number(tool.koin)) {
      alert(`Koin kamu tidak cukup. Butuh ${tool.koin} Koin untuk mengakses ${tool.nama}.`);
      return;
    }
    
    setIsDeducting(true);
    try {
      // Potong koin
      const { error } = await supabase
        .from('users_data')
        .update({ koin: Number(koin) - Number(tool.koin) })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Lanjut halaman jika sukses
      router.push(`/${tool.id === 'generator' ? 'generator' : 'dashboard/' + tool.id}`);
    } catch (err) {
      console.error(err);
      alert("Gagal memotong koin karena gangguan sistem. Silakan coba lagi.");
    } finally {
      setIsDeducting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
        <div className="mb-8 border-b border-slate-100 pb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
              <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><SparklesIcon /></span> Direktori AI Tools
            </h2>
          </div>
          <div className="hidden md:flex bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl items-center gap-2">
            <span className="text-amber-500 text-lg">🪙</span>
            <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Saldo</p><p className="text-sm font-black text-slate-800">{koin} Koin</p></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
          {isDeducting && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-2xl">
                <div className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl animate-pulse">Memproses Koin...</div>
             </div>
          )}
          {tools.map(tool => (
            <ToolItem key={tool.id} icon={getIcon(tool.id)} label={tool.nama} coin={tool.koin} tooltip={tool.tooltip} isHot={tool.is_hot} isFree={Number(tool.koin) === 0} onClick={() => handleToolClick(tool)} />
          ))}
        </div>
      </div>
    </div>
  );
}