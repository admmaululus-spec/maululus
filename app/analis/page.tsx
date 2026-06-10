export const runtime = 'edge';

import React from 'react';
import Link from 'next/link';

export default function AnalisProfilePage() {
  // Data dummy analis (Nantinya bisa Anda ambil dari Supabase database)
  const analysts = [
    {
      id: 'analyst-1',
      name: 'Budi Santoso, M.Kom',
      specialty: 'Sistem Informasi & Software Engineering',
      experience: '5+ Tahun',
      image: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=0f2a4a&color=fff&size=150',
      status: 'Tersedia',
    },
    {
      id: 'analyst-2',
      name: 'Siti Aminah, M.Pd',
      specialty: 'Pendidikan & Penelitian Kualitatif',
      experience: '8+ Tahun',
      image: 'https://ui-avatars.com/api/?name=Siti+Aminah&background=22c55e&color=fff&size=150',
      status: 'Tersedia',
    },
    {
      id: 'analyst-3',
      name: 'Dr. Andi Pratama',
      specialty: 'Manajemen Bisnis & Akuntansi',
      experience: '10+ Tahun',
      image: 'https://ui-avatars.com/api/?name=Andi+Pratama&background=0f2a4a&color=fff&size=150',
      status: 'Sibuk',
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-[#0f2a4a] pb-20">
      
      {/* Header Section */}
      <section className="bg-white border-b border-slate-200 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Link href="/" className="inline-block mb-6 text-sm font-bold text-slate-500 hover:text-green-600 transition-colors">
            &larr; Kembali ke Beranda
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0f2a4a] tracking-tight">
            Konsultasi dengan <span className="text-green-500">Pakar Skripsi</span>
          </h1>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-lg">
            Diskusikan hasil generate judul AI atau matangkan kerangka skripsimu langsung dengan analis akademik profesional kami.
          </p>
        </div>
      </section>

      {/* Analyst Grid */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {analysts.map((analyst) => (
            <div key={analyst.id} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={analyst.image} 
                  alt={analyst.name} 
                  className="w-16 h-16 rounded-full border-2 border-green-100 object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-[#0f2a4a] leading-tight">{analyst.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${analyst.status === 'Tersedia' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs font-semibold text-slate-500">{analyst.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Spesialisasi</span>
                  <span className="text-sm font-medium text-slate-700">{analyst.specialty}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pengalaman</span>
                  <span className="text-sm font-medium text-slate-700">{analyst.experience}</span>
                </div>
              </div>

              {/* Tombol CTA */}
              <Link 
                href={`/konsultasi/${analyst.id}`} 
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0f2a4a] py-3 text-sm font-bold text-white transition-all hover:bg-green-500 active:scale-95"
              >
                Mulai Konsultasi
              </Link>
            </div>
          ))}

        </div>
      </section>
    </div>
  );
}