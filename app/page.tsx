// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import FadeIn from './components/FadeIn';
import ServicesSection from './components/home/ServicesSection';
import Footer from './components/home/Footer';

const FALLBACK_PACKAGES = [
  { id: 1, name: 'Paket Proposal', price: 1850000, features: ['Penyusunan Judul & Bab 1-3', 'Revisi Terstruktur'] },
  { id: 2, name: 'Paket Seminar', price: 4200000, features: ['Olah Data Penelitian', 'Bab 4-5 & Persiapan Seminar'] },
  { id: 3, name: 'Paket Complete', price: 6000000, features: ['Full Bab 1 sampai Bab 5', 'Siap Ujian & PPT Sidang'] },
];

export default function Home() {
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      // 1. Cek Sesi User & Redirect
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const ADMIN_EMAILS = ['vianeyricky@gmail.com', 'emailkamu@gmail.com']; 
        if (session.user.email && ADMIN_EMAILS.includes(session.user.email)) {
          router.replace('/admin');
          return;
        } else {
          router.replace('/dashboard');
          return;
        }
      }

      // 2. Ambil Data Paket dari Browser (Agar lolos limit 3MB Cloudflare)
      try {
        const { data, error } = await supabase
          .from('expert_packages')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });
        
        if (error) throw error;
        setPackages(data && data.length > 0 ? data : FALLBACK_PACKAGES);
      } catch (e) {
        setPackages(FALLBACK_PACKAGES);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0f2a4a] selection:bg-green-200 overflow-x-hidden">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-[#0f2a4a]">
            Mau<span className="text-green-600">lulus</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8 font-semibold text-sm text-slate-600">
              <a href="#beranda" className="hover:text-[#0f2a4a] transition-colors">Beranda</a>
              <a href="#cara-kerja" className="hover:text-[#0f2a4a] transition-colors">Cara Kerja</a>
              <a href="#layanan" className="hover:text-[#0f2a4a] transition-colors">Layanan & Harga</a>
            </nav>
            <div className="h-5 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <Link href="/auth" className="text-sm font-bold text-slate-700 hover:text-[#0f2a4a] transition-colors px-2">Masuk</Link>
              <Link href="/auth" className="rounded-lg bg-[#0f2a4a] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95">Daftar Gratis</Link>
            </div>
          </div>
          <div className="md:hidden flex items-center gap-4">
            <Link href="/auth" className="text-sm font-bold text-[#0f2a4a]">Masuk</Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION (Sesuai Desain Gambar) */}
        <section id="beranda" className="relative flex flex-col items-center justify-center px-6 pt-16 pb-24 md:pt-24 bg-gradient-to-b from-[#F8FAFC] to-white">
          <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Kolom Kiri: Teks */}
            <FadeIn className="flex flex-col items-start text-left z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                PLATFORM AI SKRIPSI #1 DI INDONESIA
              </div>
              
              <h1 className="mb-2 text-4xl font-extrabold leading-tight tracking-tight text-[#0f2a4a] sm:text-5xl">
                AI Skripsi yang Membantu<br />Kamu Lulus Lebih Cepat.
              </h1>
              
              <h2 className="mb-6 text-5xl font-black leading-tight tracking-tight text-[#0f2a4a] sm:text-6xl uppercase">
                Kalau Kamu MAU,<br />
                <span className="text-green-600">Kamu Pasti LULUS</span>
              </h2>
              
              <p className="mb-8 max-w-lg text-lg font-medium text-slate-600 leading-relaxed">
                Maululus membantu mahasiswa menemukan judul skripsi, menyusun proposal, mencari referensi jurnal, dan membangun kerangka penelitian lebih cepat dengan bantuan AI.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link href="/generator" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 hover:-translate-y-0.5 uppercase">
                  Mulai Generate Judul &rarr;
                </Link>
              </div>

              {/* Trust Indicators (Bintang & Logo Kampus) */}
              <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-t border-slate-200 pt-8 w-full">
                <div className="flex items-center gap-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
                    ))}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">4.9/5</span>
                    <p className="text-xs text-slate-500 font-medium">Dari 5.200+ Mahasiswa</p>
                  </div>
                </div>
                
                <div className="hidden sm:block h-10 w-px bg-slate-200"></div>

              </div>
            </FadeIn>

            {/* Kolom Kanan: Mockup Dashboard (Diperbesar) */}
            <FadeIn delay={200} className="relative z-10 w-full flex justify-center lg:justify-end mt-10 lg:mt-0">
              
              {/* Tambahan scale-110 dan memperbesar max-w dari 600px menjadi 750px */}
              <div className="relative w-full max-w-[750px] lg:scale-110 lg:origin-right flex transform hover:-translate-y-2 transition-transform duration-500">
                 
                 <img 
                    src="/mockup-dashboard2.png" 
                    alt="Mockup Dashboard Maululus" 
                    className="w-full h-auto object-contain drop-shadow-2xl rounded-2xl"
                 />
                 
              </div>
              
              {/* Background Ornamen Biru (Dibuat sedikit lebih besar agar proporsional) */}
              <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/50 blur-[100px]"></div>
            </FadeIn>

          </div>
        </section>

        {/* 3 LANGKAH MENUJU WISUDA SECTION */}
        <section id="cara-kerja" className="bg-[#0f2a4a] py-20 text-white relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <FadeIn className="text-center mb-16"><h2 className="text-3xl font-extrabold tracking-tight">3 Langkah Menuju Wisuda</h2></FadeIn>
            <div className="grid gap-8 md:grid-cols-3 relative">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-slate-700"></div>
              
              <FadeIn delay={200} className="text-center relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg relative mb-6">
                  <span className="absolute -top-3 -left-3 bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">01</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#0f2a4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">01. Input Data</h3>
                <p className="text-slate-400 text-sm max-w-xs">Ketik program studimu dan topik apa yang paling kamu sukai.</p>
              </FadeIn>
              
              <FadeIn delay={400} className="text-center relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg relative mb-6">
                  <span className="absolute -top-3 -left-3 bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">02</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#0f2a4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">02. Biar AI Bekerja</h3>
                <p className="text-slate-400 text-sm max-w-xs">AI akan meracik kombinasi judul, metode, dan masalah relevan.</p>
              </FadeIn>
              
              <FadeIn delay={600} className="text-center relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg relative mb-6">
                  <span className="absolute -top-3 -left-3 bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs">03</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#0f2a4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold mb-3">03. Konsul & ACC</h3>
                <p className="text-slate-400 text-sm max-w-xs">Bawa hasil rekomendasi ke Dosen Pembimbingmu dengan percaya diri.</p>
              </FadeIn>
            </div>
          </div>
        </section>
        
        {/* LAYANAN & HARGA SECTION */}
        <section id="layanan" className="py-24 bg-[#F8FAFC]">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn className="text-center mb-16">
              <h2 className="text-3xl font-extrabold sm:text-4xl text-[#0f2a4a] tracking-tight">Pilihan Layanan Expert</h2>
              <p className="mt-4 text-slate-500 text-lg">Bimbingan penyusunan skripsi langsung dengan praktisi & akademisi terbaik</p>
            </FadeIn>
            
            {isLoading ? (
               <div className="text-center py-12 text-slate-500 animate-pulse font-bold">Memuat daftar paket layanan...</div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8 items-center">
                {packages.map((pkg: any, idx: number) => (
                  <FadeIn key={pkg.id || idx} delay={idx * 150} className={
                    idx === 1 
                      ? "bg-[#0f2a4a] rounded-3xl p-8 shadow-2xl relative scale-105 border-4 border-[#0f2a4a]" 
                      : "bg-white rounded-3xl p-8 border border-slate-200"
                  }>
                    {idx === 1 && (
                      <span className="absolute top-6 right-6 bg-amber-400 text-[#0f2a4a] px-3 py-1 rounded-full text-xs font-black tracking-wide">POPULAR</span>
                    )}
                    <h3 className={`text-xl font-bold ${idx === 1 ? 'text-white' : 'text-[#0f2a4a]'}`}>{pkg.name}</h3>
                    
                    <div className="mt-4 mb-2">
                      <span className={`text-3xl font-extrabold ${idx === 1 ? 'text-white' : 'text-[#0f2a4a]'}`}>
                        Rp{(pkg.price || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-6 pb-6 ${idx === 1 ? 'text-slate-300 border-b border-slate-700' : 'text-slate-500 border-b border-slate-100'}`}>
                      {idx === 0 && "Paket pengantar Bab 1 hingga Bab 3 untuk proposal skripsimu."}
                      {idx === 1 && "Siap presentasi dengan Bab 4 dan 5 setelah seminar proposal."}
                      {idx === 2 && "Penyusunan lengkap dari Proposal hingga Skripsi Acc Dosen."}
                    </p>
                    
                    <ul className="space-y-4 mb-8">
                      {Array.isArray(pkg.features) ? pkg.features.map((feature: string, fIdx: number) => (
                        <li key={fIdx} className={`flex items-start gap-3 text-sm ${idx === 1 ? 'text-slate-200' : 'text-slate-600'}`}>
                          <svg className={`w-5 h-5 shrink-0 ${idx === 1 ? 'text-green-400' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> 
                          {feature}
                        </li>
                      )) : null}
                    </ul>
                    
                    <Link href={`/dashboard`} className={`block w-full text-center py-4 rounded-xl font-bold transition-colors ${
                      idx === 1 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'border border-slate-200 text-green-600 hover:bg-slate-50'
                    }`}>
                      Pesan Sekarang
                    </Link>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="mx-auto max-w-4xl px-6">
            <FadeIn className="bg-[#F8FAFC] rounded-3xl p-10 text-center border border-slate-100 flex flex-col items-center">
              <h2 className="text-3xl font-extrabold text-[#0f2a4a] mb-2 tracking-tight">Sudah Siap Pakai Toga? 🎓</h2>
              <p className="text-slate-500 mb-8">Mulai perjalanan skripsimu sekarang. Gratis!</p>
              <Link href="/auth" className="inline-flex items-center gap-3 rounded-xl bg-green-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-green-600/20 hover:bg-green-700 uppercase tracking-wide transition-all hover:-translate-y-1">
                Daftar Akun Gratis
              </Link>
              <p className="text-xs text-slate-400 mt-4">Tidak perlu kartu kredit</p>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}