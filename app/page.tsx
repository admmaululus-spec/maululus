'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

// === KOMPONEN ANIMASI SCROLL (FADE IN + BLUR) ===
const FadeIn = ({ children, delay = 0, className = '' }: { children: ReactNode, delay?: number, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target); 
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' } 
    );

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0 blur-none' 
          : 'opacity-0 translate-y-16 blur-md' 
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// === HALAMAN UTAMA ===
export default function Home() {
  const router = useRouter();

  // ⚠️ DAFTAR EMAIL ADMIN (Pastikan sama dengan yang ada di app/admin/layout.tsx)
  const ADMIN_EMAILS = ['admin@maululus.com', 'emailkamu@gmail.com']; 

  useEffect(() => {
    // Membaca perubahan status autentikasi
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        
        // Cek apakah email yang login adalah milik Admin
        const userEmail = session.user.email || '';
        
        if (ADMIN_EMAILS.includes(userEmail)) {
          router.push('/admin'); // Lempar ke Dashboard Admin
        } else {
          router.push('/dashboard'); // Lempar ke Dashboard Mahasiswa
        }
        
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      
      {/* Navbar Minimalis Elegan */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-extrabold tracking-tight text-blue-700">
              Mau<span className="text-blue-500">lulus</span>
            </div>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8 font-medium text-sm text-slate-500">
              <a href="#beranda" className="hover:text-slate-900 transition-colors">Beranda</a>
              <a href="#fitur" className="hover:text-slate-900 transition-colors">Fitur</a>
              <a href="#cara-kerja" className="hover:text-slate-900 transition-colors">Cara Kerja</a>
            </nav>
            
            {/* Garis Pemisah (Divider) */}
            <div className="h-5 w-px bg-slate-200"></div>
            
            {/* Area Autentikasi (Login/Register) */}
            <div className="flex items-center gap-4">
              <Link href="/auth" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-2">
                Masuk
              </Link>
              <Link href="/auth" className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95 flex items-center gap-2">
                Daftar Gratis
              </Link>
            </div>
          </div>

          {/* Menu Mobile (Sederhana) */}
          <div className="md:hidden flex items-center gap-4">
            <Link href="/auth" className="text-sm font-bold text-slate-900">
              Masuk
            </Link>
          </div>

        </div>
      </header>

      <main className="overflow-x-hidden">
        {/* 1. HERO SECTION */}
        <section id="beranda" className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 pt-16 pb-20">
          <div className="absolute top-10 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[120px]"></div>
          
          {/* Konten Hero Utama */}
          <FadeIn className="max-w-4xl text-center w-full z-10">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/50 px-5 py-2 text-xs font-bold uppercase tracking-widest text-blue-700 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Platform AI Skripsi #1 di Indonesia
            </div>
            
            <h1 className="mb-8 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-7xl">
              Kalau Kamu MAU <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">
                Kamu Pasti LULUS
              </span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg font-medium text-slate-500 sm:text-xl leading-relaxed">
              Udah Mau Lulus ya ?. Maululus membantu mahasiswa menemukan judul skripsi, menyusun proposal, mencari referensi jurnal, dan membangun kerangka penelitian lebih cepat dengan bantuan AI.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/generator" className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-700 hover:-translate-y-1 sm:w-auto uppercase tracking-wide">
                Mulai Generate Judul
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
              <a href="#fitur" className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 sm:w-auto uppercase tracking-wide">
                Eksplor Fitur
              </a>
            </div>
          </FadeIn>

          {/* BANNER FITUR (Trust Badge) */}
          <FadeIn delay={400} className="w-full max-w-6xl mt-24 z-10">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              {/* Item 1 */}
              <div className="flex items-start md:items-center gap-4 px-2 md:px-6 flex-1 w-full pt-4 md:pt-0 first:pt-0">
                <div className="h-12 w-12 shrink-0 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">AI Assistant Cerdas</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Bantu riset, ide, outline, hingga penulisan.</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start md:items-center gap-4 px-2 md:px-6 flex-1 w-full pt-4 md:pt-0">
                <div className="h-12 w-12 shrink-0 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h7.5M8.25 15h7.5M8.25 18h7.5" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Sumber Terpercaya</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Referensi jurnal & buku akurat dan relevan.</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start md:items-center gap-4 px-2 md:px-6 flex-1 w-full pt-4 md:pt-0">
                <div className="h-12 w-12 shrink-0 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-9 h-9"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Hemat Waktu</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Skripsi selesai lebih cepat, kualitas tetap terjaga.</p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-start md:items-center gap-4 px-2 md:px-6 flex-1 w-full pt-4 md:pt-0">
                <div className="h-12 w-12 shrink-0 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Aman & Terpercaya</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Privasi terjamin, data 100% aman.</p>
                </div>
              </div>

            </div>
          </FadeIn>
        </section>

        {/* 2. SECTION: MASALAH MAHASISWA */}
        <section className="bg-slate-900 py-24 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold sm:text-4xl text-white tracking-tight">Fase Terberat Mahasiswa Akhir</h2>
                <p className="mt-4 text-slate-400 text-lg">Kami tahu persis apa yang membuat skripsimu tidak kunjung selesai.</p>
              </div>
            </FadeIn>

            <div className="grid gap-6 md:grid-cols-3">
              <FadeIn delay={100} className="rounded-3xl bg-slate-800/40 p-8 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/50 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-100">Mentok Ide Judul</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Sudah ngajuin 5 judul ke Dosen Pembimbing tapi ditolak semua karena dianggap kurang inovatif atau pasaran.</p>
              </FadeIn>
              <FadeIn delay={300} className="rounded-3xl bg-slate-800/40 p-8 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/50 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-100">Bingung Mulai Nulis</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Judul sudah ACC, tapi layar laptop berjam-jam dibiarkan kosong karena bingung menyusun kalimat Latar Belakang.</p>
              </FadeIn>
              <FadeIn delay={500} className="rounded-3xl bg-slate-800/40 p-8 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/50 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-100">Takut Plagiasi (Turnitin)</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Kesulitan memparafrase kalimat dari jurnal referensi, takut ketahuan copy-paste saat dicek Turnitin oleh kampus.</p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* 3. FEATURE DETAIL SECTION */}
        <section id="fitur" className="py-24 sm:py-32 scroll-mt-20">
          <div className="mx-auto max-w-7xl px-6">
            <FadeIn>
              <div className="text-center mb-24">
                <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">Senjata Rahasia Kamu</h2>
                <p className="mt-4 text-lg text-slate-500 font-medium">Biar AI yang kerja keras, kamu tinggal revisi ringan dan bimbingan.</p>
              </div>
            </FadeIn>

            {/* Fitur 1: Kiri Gambar, Kanan Teks */}
            <div className="flex flex-col lg:flex-row items-center gap-16 mb-28">
              <FadeIn delay={100} className="w-full lg:w-1/2">
                <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-blue-50 to-slate-50 border border-slate-200/60 shadow-xl flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-3xl"></div>
                   <div className="relative z-10 text-blue-600">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-40 h-40"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                   </div>
                </div>
              </FadeIn>
              <FadeIn delay={300} className="w-full lg:w-1/2 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 uppercase tracking-widest">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div> Tersedia
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">Generator Judul Anti-Pasaran</h3>
                <p className="text-lg text-slate-500 leading-relaxed">
                  Cukup ketik jurusan dan minatmu. Mesin AI kami telah dilatih dengan ribuan jurnal terbaru untuk menghasilkan ide judul yang akademis, logis, dan sangat spesifik. Ucapkan selamat tinggal pada penolakan Dosen Pembimbing.
                </p>
                <ul className="space-y-4 text-slate-700 font-medium mt-8">
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Disesuaikan dengan program studi
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Menyertakan metode penelitian yang relevan
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Hasil *generate* dalam hitungan detik
                  </li>
                </ul>
              </FadeIn>
            </div>

            {/* Fitur 2: Kiri Teks, Kanan Gambar */}
            <div className="flex flex-col-reverse lg:flex-row items-center gap-16 mb-28">
              <FadeIn delay={300} className="w-full lg:w-1/2 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div> Tersedia
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">Penyusun Kerangka (Outline)</h3>
                <p className="text-lg text-slate-500 leading-relaxed">
                  Tidak tahu harus menulis apa di BAB 2 atau BAB 3? Masukkan judul skripsimu, dan AI akan membuatkan kerangka bab demi bab, sub-bab demi sub-bab yang sangat sistematis dan sesuai standar kampus.
                </p>
              </FadeIn>
              <FadeIn delay={100} className="w-full lg:w-1/2">
                <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/60 shadow-xl flex items-center justify-center relative overflow-hidden">
                   <div className="relative z-10 text-slate-400">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-40 h-40"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                   </div>
                </div>
              </FadeIn>
            </div>

            {/* Fitur 3: Kiri Gambar, Kanan Teks */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <FadeIn delay={100} className="w-full lg:w-1/2">
                <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/60 shadow-xl flex items-center justify-center relative overflow-hidden">
                   <div className="relative z-10 text-slate-400">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-40 h-40"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg>
                   </div>
                </div>
              </FadeIn>
              <FadeIn delay={300} className="w-full lg:w-1/2 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div> Tersedia
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">AI Copilot & Parafrase</h3>
                <p className="text-lg text-slate-500 leading-relaxed">
                  Asisten menulismu yang aktif 24 jam. Minta AI untuk mengembangkan sebuah poin menjadi paragraf utuh bergaya bahasa akademis, atau parafrase teks dari jurnal agar aman 100% dari cek Turnitin.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* 4. CARA KERJA SECTION */}
        <section id="cara-kerja" className="bg-slate-900 py-24 text-white relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <FadeIn className="text-center mb-20">
              <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">3 Langkah Menuju Wisuda</h2>
            </FadeIn>

            <div className="grid gap-12 md:grid-cols-3 relative">
              {/* Garis penghubung background (hanya desktop) */}
              <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 z-0"></div>

              <FadeIn delay={200} className="text-center relative z-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-xl font-bold text-blue-400 shadow-xl mb-6">01</div>
                <h3 className="text-xl font-bold mb-3 text-slate-100">Input Data</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Ketik program studimu dan topik apa yang paling kamu sukai atau kuasai.</p>
              </FadeIn>
              <FadeIn delay={400} className="text-center relative z-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-xl font-bold text-blue-400 shadow-xl mb-6">02</div>
                <h3 className="text-xl font-bold mb-3 text-slate-100">Biar AI Bekerja</h3>
                <p className="text-slate-400 text-sm leading-relaxed">AI akan meracik kombinasi judul, metode, dan masalah yang relevan secara instan.</p>
              </FadeIn>
              <FadeIn delay={600} className="text-center relative z-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-xl font-bold text-blue-400 shadow-xl mb-6">03</div>
                <h3 className="text-xl font-bold mb-3 text-slate-100">Konsul & ACC</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Bawa hasil rekomendasi ke Dosen Pembimbingmu dengan penuh percaya diri.</p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* 5. CTA (Call To Action) */}
        <section className="py-32 bg-white border-t border-slate-100">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <FadeIn>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Sudah Siap Pakai Toga?</h2>
              <p className="text-xl text-slate-500 mb-10 leading-relaxed">Jangan biarkan skripsi menunda karir dan masa depanmu. Mulai temukan judulmu sekarang.</p>
              <Link href="/auth" className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-10 py-5 text-sm font-bold text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-95 uppercase tracking-wide">
                Daftar Akun Gratis
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </FadeIn>
          </div>
        </section>

      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 text-center">
        <p className="flex items-center justify-center gap-2 text-slate-500 font-medium text-sm">
          © {new Date().getFullYear()} Maululus. Dibuat dengan 
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-300">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          agar kamu cepat lulus.
        </p>
      </footer>
    </div>
  );
}