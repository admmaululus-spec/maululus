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
  const [packages, setPackages] = useState<any[]>([]);

  // ⚠️ DAFTAR EMAIL ADMIN
  const ADMIN_EMAILS = ['vianeyricky@gmail.com', 'emailkamu@gmail.com']; 

  useEffect(() => {
    // Tarik data Paket Expert untuk ditampilkan ke Publik / Midtrans
    const fetchPackages = async () => {
      const { data } = await supabase
        .from('expert_packages')
        .select('*')
        .order('harga', { ascending: true });
      if (data) setPackages(data);
    };
    fetchPackages();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userEmail = session.user.email || '';
        if (ADMIN_EMAILS.includes(userEmail)) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    
  }, [router]);

  // Format IDR untuk memenuhi syarat Midtrans (Menggunakan Rupiah)
  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

  // Fungsi pemesanan publik
  const handlePesanPublik = () => {
    alert("Silakan Daftar atau Masuk terlebih dahulu untuk melakukan pemesanan dan mengakses dashboard pengerjaan proyek Kamu.");
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#0f2a4a] selection:bg-green-200">
      
      {/* Navbar Minimalis Elegan */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-[#0f2a4a]">
              Mau<span className="text-green-500">lulus</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8 font-medium text-sm text-slate-500">
              <a href="#beranda" className="hover:text-[#0f2a4a] transition-colors">Beranda</a>
              <a href="#fitur" className="hover:text-[#0f2a4a] transition-colors">Fitur</a>
              <a href="#cara-kerja" className="hover:text-[#0f2a4a] transition-colors">Cara Kerja</a>
              <a href="#layanan" className="hover:text-green-600 font-bold transition-colors">Layanan & Harga</a>
            </nav>
            
            <div className="h-5 w-px bg-slate-200"></div>
            
            <div className="flex items-center gap-4">
              <Link href="/auth" className="text-sm font-bold text-slate-600 hover:text-[#0f2a4a] transition-colors px-2">
                Masuk
              </Link>
              <Link href="/auth" className="rounded-xl bg-[#0f2a4a] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95 flex items-center gap-2">
                Daftar Gratis
              </Link>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <Link href="/auth" className="text-sm font-bold text-[#0f2a4a]">
              Masuk
            </Link>
          </div>
        </div>
      </header>

      <main className="overflow-x-hidden">
        {/* 1. HERO SECTION */}
        <section id="beranda" className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 pt-16 pb-20">
          <div className="absolute top-10 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-green-500/10 blur-[120px]"></div>
          
          <FadeIn className="max-w-4xl text-center w-full z-10">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-green-200/50 bg-green-50/50 px-5 py-2 text-xs font-bold uppercase tracking-widest text-green-700 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Platform AI Skripsi #1 di Indonesia
            </div>
            
            <h1 className="mb-8 text-5xl font-extrabold leading-tight tracking-tight text-[#0f2a4a] sm:text-7xl">
              Kalau Kamu MAU <br />
              <span className="text-green-500">
                Kamu Pasti LULUS
              </span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg font-medium text-slate-500 sm:text-xl leading-relaxed">
              Udah Mau Lulus ya? Maululus membantu mahasiswa menemukan judul skripsi, menyusun proposal, mencari referensi jurnal, dan membangun kerangka penelitian lebih cepat dengan bantuan AI.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/generator" className="w-full flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-green-500/20 transition-all hover:bg-green-600 hover:-translate-y-1 sm:w-auto uppercase tracking-wide">
                Mulai Generate Judul
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
              <a href="#layanan" className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-700 transition-all hover:border-green-300 hover:bg-slate-50 sm:w-auto uppercase tracking-wide">
                Lihat Paket Expert
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={400} className="w-full max-w-6xl mt-24 z-10">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="flex items-start md:items-center gap-4 px-2 md:px-6 flex-1 w-full pt-4 md:pt-0 first:pt-0">
                <div className="h-12 w-12 shrink-0 flex items-center justify-center text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0f2a4a]">AI Assistant Cerdas</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Bantu riset, ide, outline, hingga penulisan.</p>
                </div>
              </div>
              <div className="flex items-start md:items-center gap-4 px-2 md:px-6 flex-1 w-full pt-4 md:pt-0">
                <div className="h-12 w-12 shrink-0 flex items-center justify-center text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h7.5M8.25 15h7.5M8.25 18h7.5" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0f2a4a]">Sumber Terpercaya</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Referensi jurnal & buku akurat dan relevan.</p>
                </div>
              </div>
              <div className="flex items-start md:items-center gap-4 px-2 md:px-6 flex-1 w-full pt-4 md:pt-0">
                <div className="h-12 w-12 shrink-0 flex items-center justify-center text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-9 h-9"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0f2a4a]">Hemat Waktu</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Skripsi selesai lebih cepat, kualitas terjaga.</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* 2. SECTION: MASALAH MAHASISWA */}
        <section className="bg-[#0f2a4a] py-24 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold sm:text-4xl text-white tracking-tight">Fase Terberat Mahasiswa Akhir</h2>
                <p className="mt-4 text-slate-300 text-lg">Kami tahu persis apa yang membuat skripsimu tidak kunjung selesai.</p>
              </div>
            </FadeIn>
            <div className="grid gap-6 md:grid-cols-3">
              <FadeIn delay={100} className="rounded-3xl bg-slate-800/40 p-8 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/50 text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Mentok Ide Judul</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Sudah ngajuin 5 judul ke Dosen Pembimbing tapi ditolak semua karena dianggap kurang inovatif atau pasaran.</p>
              </FadeIn>
              <FadeIn delay={300} className="rounded-3xl bg-slate-800/40 p-8 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/50 text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Bingung Mulai Nulis</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Judul sudah ACC, tapi layar laptop berjam-jam dibiarkan kosong karena bingung menyusun kalimat Latar Belakang.</p>
              </FadeIn>
              <FadeIn delay={500} className="rounded-3xl bg-slate-800/40 p-8 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/50 text-green-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Takut Plagiasi (Turnitin)</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Kesulitan memparafrase kalimat dari jurnal referensi, takut ketahuan copy-paste saat dicek Turnitin oleh kampus.</p>
              </FadeIn>
            </div>
          </div>
        </section>

       {/* 3. LAYANAN & HARGA (KHUSUS REVIEW MIDTRANS) */}
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
                  <button onClick={handlePesanPublik} className={`w-full py-4 font-bold rounded-xl transition-colors ${idx === 1 ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg' : 'bg-slate-50 text-emerald-700 border border-slate-200 hover:bg-emerald-50'}`}>
                    Pesan Sekarang
                  </button>
                </FadeIn>
              )) : (
                <div className="col-span-3 text-center text-slate-500 py-10 font-medium">Memuat katalog layanan...</div>
              )}
            </div>
          </div>
        </section>

        {/* 4. CARA KERJA SECTION */}
        <section id="cara-kerja" className="bg-[#0f2a4a] py-24 text-white relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <FadeIn className="text-center mb-20">
              <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">3 Langkah Menuju Wisuda</h2>
            </FadeIn>

            <div className="grid gap-12 md:grid-cols-3 relative">
              <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[1px] bg-slate-700 z-0"></div>

              <FadeIn delay={200} className="text-center relative z-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-xl font-bold text-green-400 shadow-xl mb-6">01</div>
                <h3 className="text-xl font-bold mb-3 text-white">Input Data</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Ketik program studimu dan topik apa yang paling kamu sukai.</p>
              </FadeIn>
              <FadeIn delay={400} className="text-center relative z-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-xl font-bold text-green-400 shadow-xl mb-6">02</div>
                <h3 className="text-xl font-bold mb-3 text-white">Biar AI Bekerja</h3>
                <p className="text-slate-400 text-sm leading-relaxed">AI akan meracik kombinasi judul, metode, dan masalah yang relevan.</p>
              </FadeIn>
              <FadeIn delay={600} className="text-center relative z-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-xl font-bold text-green-400 shadow-xl mb-6">03</div>
                <h3 className="text-xl font-bold mb-3 text-white">Konsul & ACC</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Bawa hasil rekomendasi ke Dosen Pembimbingmu dengan percaya diri.</p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* 5. CTA (Call To Action) */}
        <section className="py-32 bg-white border-t border-slate-100">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <FadeIn>
              <h2 className="text-4xl font-extrabold text-[#0f2a4a] mb-6 tracking-tight">Sudah Siap Pakai Toga?</h2>
              <p className="text-xl text-slate-500 mb-10 leading-relaxed">Jangan biarkan skripsi menunda karir dan masa depanmu. Mulai temukan judulmu sekarang.</p>
              <Link href="/auth" className="inline-flex items-center gap-3 rounded-2xl bg-green-500 px-10 py-5 text-sm font-bold text-white shadow-xl shadow-green-500/20 transition-all hover:bg-green-600 active:scale-95 uppercase tracking-wide">
                Daftar Akun Gratis
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </FadeIn>
          </div>
        </section>

      </main>
      
      {/* 6. FOOTER LENGKAP (STANDAR MIDTRANS) */}
      <footer className="border-t border-slate-200 bg-slate-50 pt-16 pb-8 px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          <div className="md:col-span-2">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-[#0f2a4a]">
              Mau<span className="text-green-500">lulus</span>
            </Link>
            <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-sm">
              Platform pendamping skripsi berbasis AI pertama di Indonesia. Membantu menyusun kerangka, parafrase anti-plagiasi, dan konsultasi expert untuk memastikan Kamu lulus tepat waktu.
            </p>
          </div>

          {/* Kontak Bisnis */}
          <div>
            <h4 className="font-bold text-[#0f2a4a] mb-5">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                support@maululus.com
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                +62 85-815-9999-53 {/* Ganti dengan nomor WhatsApp operasional yang aktif */}
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Kota Malang, Jawa Timur
              </li>
            </ul>
          </div>

          {/* Tautan Legal*/}
          <div>
            <h4 className="font-bold text-[#0f2a4a] mb-5">Informasi Legal</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-500 flex flex-col">
              <Link href="/terms-and-conditions" className="hover:text-green-600 transition-colors">Syarat & Ketentuan</Link>
              <Link href="/kebijakan-privasi" className="hover:text-green-600 transition-colors">Kebijakan Privasi</Link>
              <Link href="/kebijakan-pengembalian" className="hover:text-green-600 transition-colors">Kebijakan Pengembalian Dana</Link>
            </ul>
          </div>

        </div>

        <div className="mx-auto max-w-7xl pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-2 text-slate-400 font-medium text-xs sm:text-sm">
            © {new Date().getFullYear()} Maululus. Dibuat dengan 
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            agar kamu cepat lulus.
          </p>
          <div className="text-xs font-bold text-slate-300">
            Transaksi Aman Terlindungi via Midtrans
          </div>
        </div>
      </footer>

    </div>
  );
}