// Wajib untuk deploy di Cloudflare Pages agar tidak error
export const runtime = 'edge'; 

import React from 'react';
import Link from 'next/link';

export default function AnalisPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-[#0f2a4a]">
      
      {/* Simple Header Back */}
      <div className="p-6">
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-[#0f2a4a] flex items-center gap-2">
          &larr; Kembali ke Beranda
        </Link>
      </div>

      {/* Hero Section Analis */}
      <section className="py-12 px-4 max-w-6xl mx-auto text-center">
        <span className="bg-green-100 text-green-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
          Fitur Unggulan Maululus
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f2a4a] mt-6 tracking-tight">
          Analisis Skripsi <span className="text-green-500">Lebih Cerdas</span> & Akurat
        </h1>
        <p className="text-slate-500 mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
          Bantu deteksi kelemahan proposal, uji kelayakan judul, dan cari celah penelitian (research gap) hanya dalam hitungan detik menggunakan AI.
        </p>
      </section>

      {/* Main Features Grid */}
      <section className="py-10 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="border border-slate-200/60 rounded-3xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-[#0f2a4a] mb-3">Uji Kelayakan Judul</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Uji seberapa kuat judul skripsimu di mata dosen penguji. AI akan memberikan skor kelayakan beserta saran perbaikan redaksionalnya.
            </p>
          </div>

          {/* Card 2 */}
          <div className="border border-slate-200/60 rounded-3xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-[#0f2a4a] mb-3">Cek Kerangka Teori</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Menganalisis keselarasan antara judul, rumusan masalah, dan landasan teori yang Anda gunakan agar isi skripsi tidak melenceng.
            </p>
          </div>

          {/* Card 3 */}
          <div className="border border-slate-200/60 rounded-3xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-[#0f2a4a] mb-3">Cari Research Gap</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Menemukan celah atau kebaruan (novelty) dari penelitian terdahulu sehingga argumen skripsi Anda menjadi lebih kuat saat sidang.
            </p>
          </div>

        </div>
      </section>

      {/* Interactive Form Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto my-12">
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 md:p-12 shadow-xl shadow-slate-200/50">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-[#0f2a4a]">Mulai Analisis Dokumen Anda</h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              Silakan login terlebih dahulu untuk mengakses form analisis. Masukkan draf bab, abstrak, atau judul skripsi Anda di dasbor member.
            </p>
          </div>
          
          <div className="flex justify-center">
             <Link href="/auth" className="inline-flex items-center gap-2 rounded-xl bg-[#0f2a4a] px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95 uppercase tracking-wide">
                Masuk ke Dashboard
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
             </Link>
          </div>
        </div>
      </section>

    </div>
  );
}