'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import FadeIn from '../FadeIn';
import AuthModal from '../AuthModal';

export default function ServicesSection() {
  const [packages, setPackages] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      const { data } = await supabase
        .from('expert_packages')
        .select('*')
        .order('harga', { ascending: true });
      if (data) setPackages(data);
    };
    fetchPackages();
  }, []);

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

  return (
    <section id="layanan" className="py-24 bg-white scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-[#0f2a4a] sm:text-4xl tracking-tight">Pilihan Layanan Expert</h2>
          <p className="mt-4 text-lg text-slate-500 font-medium">Bimbingan penyusunan 1-on-1 langsung dengan praktisi & akademisi handal.</p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.length > 0 ? packages.map((pkg, idx) => (
            <FadeIn 
              key={pkg.id} 
              delay={idx * 200}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all z-10 ${
                idx === 1 
                  ? 'bg-[#0B1525] border border-blue-900 shadow-2xl transform lg:-translate-y-4' 
                  : 'bg-white border border-slate-200 shadow-sm hover:border-emerald-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-xl font-bold ${idx === 1 ? 'text-white' : 'text-slate-800'}`}>{pkg.nama}</h3>
                  {idx === 1 && <span className="bg-amber-400 text-amber-950 text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase">Populer</span>}
                </div>
                <div className="mt-4 mb-6">
                  <span className={`text-3xl font-black ${idx === 1 ? 'text-white' : 'text-slate-800'}`}>{formatRp(pkg.harga)}</span>
                </div>
                <p className={`text-sm mb-6 leading-relaxed ${idx === 1 ? 'text-slate-300' : 'text-slate-500'}`}>{pkg.deskripsi}</p>
                
                <ul className="space-y-4 mb-8">
                  {pkg.fitur && pkg.fitur.map((f: string, i: number) => (
                    <li key={i} className={`text-sm flex items-start gap-3 ${idx === 1 ? 'text-slate-300' : 'text-slate-700'}`}>
                      <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className={`w-full py-4 font-bold rounded-xl transition-colors ${idx === 1 ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg' : 'bg-slate-50 text-emerald-700 border border-slate-200 hover:bg-emerald-50'}`}
              >
                Pesan Sekarang
              </button>
            </FadeIn>
          )) : (
            <div className="col-span-3 text-center text-slate-500 py-10 font-medium">Memuat katalog layanan...</div>
          )}
        </div>
      </div>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}