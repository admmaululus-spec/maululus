'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import FadeIn from './components/FadeIn';
import ServicesSection from './components/home/ServicesSection';
import Footer from './components/home/Footer';

export default function Home() {
  const router = useRouter();
  const ADMIN_EMAILS = ['vianeyricky@gmail.com', 'emailkamu@gmail.com']; 

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#0f2a4a] selection:bg-green-200">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-[#0f2a4a]">
            Mau<span className="text-green-500">lulus</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8 font-medium text-sm text-slate-500">
              <a href="#beranda" className="hover:text-[#0f2a4a] transition-colors">Beranda</a>
              <a href="#fitur" className="hover:text-[#0f2a4a] transition-colors">Fitur</a>
              <a href="#cara-kerja" className="hover:text-[#0f2a4a] transition-colors">Cara Kerja</a>
              <a href="#layanan" className="hover:text-green-600 font-bold transition-colors">Layanan & Harga</a>
            </nav>
            <div className="h-5 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4">
              <Link href="/auth" className="text-sm font-bold text-slate-600 hover:text-[#0f2a4a] transition-colors px-2">Masuk</Link>
              <Link href="/auth" className="rounded-xl bg-[#0f2a4a] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95 flex items-center gap-2">Daftar Gratis</Link>
            </div>
          </div>
          <div className="md:hidden flex items-center gap-4">
            <Link href="/auth" className="text-sm font-bold text-[#0f2a4a]">Masuk</Link>
          </div>
        </div>
      </header>

      <main className="overflow-x-hidden">
        {/* HERO SECTION */}
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
              <span className="text-green-500">Kamu Pasti LULUS</span>
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
        </section>

        {/* PROBLEM SECTION */}
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
                <h3 className="text-xl font-bold mb-3 text-white">Mentok Ide Judul</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Sudah ngajuin 5 judul ke Dosen Pembimbing tapi ditolak semua karena dianggap kurang inovatif atau pasaran.</p>
              </FadeIn>
              <FadeIn delay={300} className="rounded-3xl bg-slate-800/40 p-8 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <h3 className="text-xl font-bold mb-3 text-white">Bingung Mulai Nulis</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Judul sudah ACC, tapi layar laptop berjam-jam dibiarkan kosong karena bingung menyusun kalimat Latar Belakang.</p>
              </FadeIn>
              <FadeIn delay={500} className="rounded-3xl bg-slate-800/40 p-8 border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                <h3 className="text-xl font-bold mb-3 text-white">Takut Plagiasi (Turnitin)</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Kesulitan memparafrase kalimat dari jurnal referensi, takut ketahuan copy-paste saat dicek Turnitin.</p>
              </FadeIn>
            </div>
          </div>
        </section>

        <ServicesSection />

        {/* CARA KERJA & CTA SECTION */}
        <section id="cara-kerja" className="bg-[#0f2a4a] py-24 text-white relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <FadeIn className="text-center mb-20"><h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">3 Langkah Menuju Wisuda</h2></FadeIn>
            <div className="grid gap-12 md:grid-cols-3 relative">
              <FadeIn delay={200} className="text-center relative z-10"><h3 className="text-xl font-bold mb-3">01. Input Data</h3><p className="text-slate-400 text-sm">Ketik program studimu dan topik apa yang paling kamu sukai.</p></FadeIn>
              <FadeIn delay={400} className="text-center relative z-10"><h3 className="text-xl font-bold mb-3">02. Biar AI Bekerja</h3><p className="text-slate-400 text-sm">AI akan meracik kombinasi judul, metode, dan masalah relevan.</p></FadeIn>
              <FadeIn delay={600} className="text-center relative z-10"><h3 className="text-xl font-bold mb-3">03. Konsul & ACC</h3><p className="text-slate-400 text-sm">Bawa hasil rekomendasi ke Dosen Pembimbingmu dengan percaya diri.</p></FadeIn>
            </div>
          </div>
        </section>
        
        <section className="py-32 bg-white border-t border-slate-100">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <FadeIn>
              <h2 className="text-4xl font-extrabold text-[#0f2a4a] mb-6 tracking-tight">Sudah Siap Pakai Toga?</h2>
              <Link href="/auth" className="inline-flex items-center gap-3 rounded-2xl bg-green-500 px-10 py-5 text-sm font-bold text-white shadow-xl hover:bg-green-600 uppercase tracking-wide">
                Daftar Akun Gratis
              </Link>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}