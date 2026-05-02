'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, ReactNode } from 'react';

// === KOMPONEN ANIMASI SCROLL (FADE IN + BLUR) ===
const FadeIn = ({ children, delay = 0, className = '' }: { children: ReactNode, delay?: number, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Jika elemen masuk ke layar, jalankan animasi
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target); // Animasi hanya jalan sekali
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' } // Trigger animasi sedikit sebelum elemen terlihat penuh
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
          : 'opacity-0 translate-y-16 blur-md' // Start state: hilang, turun, dan blur
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// === HALAMAN UTAMA ===
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-lg transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-extrabold tracking-tight text-blue-700">
              Mau<span className="text-blue-500">lulus</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
            <a href="#beranda" className="hover:text-blue-600 transition-colors">Beranda</a>
            <a href="#fitur" className="hover:text-blue-600 transition-colors">Fitur</a>
            <a href="#cara-kerja" className="hover:text-blue-600 transition-colors">Cara Kerja</a>
            <Link href="/generator" className="rounded-xl bg-amber-400 px-6 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition-transform hover:scale-105 active:scale-95">
              Coba AI Gratis
            </Link>
          </nav>
        </div>
      </header>

      <main className="overflow-x-hidden">
        {/* 1. HERO SECTION */}
        <section id="beranda" className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 pt-10 pb-20">
          <div className="absolute top-10 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[120px]"></div>
          
          <FadeIn className="max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center rounded-full border border-blue-200/50 bg-white/50 px-5 py-2 text-sm font-bold text-blue-700 shadow-sm backdrop-blur-sm">
              <span className="mr-3 flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
              Platform AI Skripsi Generator #1 di Indonesia
            </div>
            
            <h1 className="mb-8 text-5xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-7xl">
              Lulus Tepat Waktu <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-400">
                Bukan Lagi Wacana
              </span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg font-medium text-slate-600 sm:text-xl leading-relaxed">
              Tinggalkan cara lama yang bikin pusing. Maululus hadir dengan asisten AI pintar yang siap membantumu menemukan ide judul, menyusun kerangka, hingga menulis skripsi 10x lebih cepat.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/generator" className="w-full rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-700 hover:-translate-y-1 sm:w-auto">
                Mulai Generate Judul
              </Link>
              <a href="#fitur" className="w-full rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-700 transition-all hover:border-blue-200 hover:bg-slate-50 sm:w-auto">
                Eksplor Fitur 👇
              </a>
            </div>
          </FadeIn>
        </section>

        {/* 2. SECTION: MASALAH MAHASISWA */}
        <section className="bg-slate-900 py-24 text-white">
          <div className="mx-auto max-w-7xl px-6">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold sm:text-4xl text-white">Fase Terberat Mahasiswa Akhir</h2>
                <p className="mt-4 text-slate-400 text-lg">Kami tahu persis apa yang membuat skripsimu tidak kunjung selesai.</p>
              </div>
            </FadeIn>

            <div className="grid gap-6 md:grid-cols-3">
              <FadeIn delay={100} className="rounded-3xl bg-slate-800/50 p-8 border border-slate-700">
                <div className="text-4xl mb-4">🤯</div>
                <h3 className="text-xl font-bold mb-2">Mentok Ide Judul</h3>
                <p className="text-slate-400">Sudah ngajuin 5 judul ke Dosen Pembimbing tapi ditolak semua karena dianggap kurang inovatif atau pasaran.</p>
              </FadeIn>
              <FadeIn delay={300} className="rounded-3xl bg-slate-800/50 p-8 border border-slate-700">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-bold mb-2">Bingung Mulai Nulis</h3>
                <p className="text-slate-400">Judul sudah ACC, tapi layar laptop berjam-jam dibiarkan kosong karena bingung menyusun kalimat untuk Latar Belakang.</p>
              </FadeIn>
              <FadeIn delay={500} className="rounded-3xl bg-slate-800/50 p-8 border border-slate-700">
                <div className="text-4xl mb-4">🕵️‍♂️</div>
                <h3 className="text-xl font-bold mb-2">Takut Plagiasi (Turnitin)</h3>
                <p className="text-slate-400">Kesulitan memparafrase kalimat dari jurnal referensi, takut ketahuan *copy-paste* saat dicek Turnitin oleh kampus.</p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* 3. FEATURE DETAIL SECTION */}
        <section id="fitur" className="py-24 sm:py-32 scroll-mt-20">
          <div className="mx-auto max-w-7xl px-6">
            <FadeIn>
              <div className="text-center mb-20">
                <h2 className="text-3xl font-extrabold text-blue-700 sm:text-5xl tracking-tight">Senjata Rahasia Kamu</h2>
                <p className="mt-6 text-xl text-slate-600 font-medium">Biar AI yang kerja keras, kamu tinggal revisi ringan dan bimbingan.</p>
              </div>
            </FadeIn>

            {/* Fitur 1: Kiri Gambar, Kanan Teks */}
            <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
              <FadeIn delay={100} className="w-full lg:w-1/2">
                <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-white shadow-2xl flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-3xl"></div>
                   <div className="text-9xl relative z-10">💡</div>
                </div>
              </FadeIn>
              <FadeIn delay={300} className="w-full lg:w-1/2 space-y-6">
                <div className="inline-block rounded-xl bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">Fitur Tersedia</div>
                <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Generator Judul Anti-Pasaran</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Cukup ketik jurusan dan minatmu. Mesin AI kami telah dilatih dengan ribuan jurnal terbaru untuk menghasilkan ide judul yang akademis, logis, dan sangat spesifik. Ucapkan selamat tinggal pada penolakan Dosen Pembimbing.
                </p>
                <ul className="space-y-3 text-slate-700 font-medium">
                  <li className="flex items-center gap-3">✅ Disesuaikan dengan program studi</li>
                  <li className="flex items-center gap-3">✅ Menyertakan metode penelitian yang relevan</li>
                  <li className="flex items-center gap-3">✅ Hasil *generate* dalam hitungan detik</li>
                </ul>
              </FadeIn>
            </div>

            {/* Fitur 2: Kiri Teks, Kanan Gambar */}
            <div className="flex flex-col-reverse lg:flex-row items-center gap-16 mb-24">
              <FadeIn delay={300} className="w-full lg:w-1/2 space-y-6">
                <div className="inline-block rounded-xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700">Segera Hadir</div>
                <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Penyusun Kerangka (Outline)</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Tidak tahu harus menulis apa di BAB 2 atau BAB 3? Masukkan judul skripsimu, dan AI akan membuatkan kerangka bab demi bab, sub-bab demi sub-bab yang sangat sistematis dan sesuai standar kampus.
                </p>
              </FadeIn>
              <FadeIn delay={100} className="w-full lg:w-1/2">
                <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-white shadow-2xl flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-3xl"></div>
                   <div className="text-9xl relative z-10">📑</div>
                </div>
              </FadeIn>
            </div>

            {/* Fitur 3: Kiri Gambar, Kanan Teks */}
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <FadeIn delay={100} className="w-full lg:w-1/2">
                <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-slate-200 to-slate-100 border-4 border-white shadow-2xl flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-slate-500/5 backdrop-blur-3xl"></div>
                   <div className="text-9xl relative z-10">🤖</div>
                </div>
              </FadeIn>
              <FadeIn delay={300} className="w-full lg:w-1/2 space-y-6">
                <div className="inline-block rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700">Dalam Pengembangan</div>
                <h3 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">AI Copilot & Parafrase</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Asisten menulismu yang aktif 24 jam. Minta AI untuk mengembangkan sebuah poin menjadi paragraf utuh bergaya bahasa akademis, atau parafrase teks dari jurnal agar aman 100% dari cek Turnitin.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* 4. CARA KERJA SECTION */}
        <section id="cara-kerja" className="bg-blue-600 py-24 text-white relative overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-500 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-700 blur-3xl"></div>
          
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <FadeIn className="text-center mb-16">
              <h2 className="text-3xl font-extrabold sm:text-4xl">3 Langkah Menuju Wisuda</h2>
            </FadeIn>

            <div className="grid gap-8 md:grid-cols-3">
              <FadeIn delay={200} className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-black text-blue-600 shadow-xl mb-6">1</div>
                <h3 className="text-xl font-bold mb-3">Input Data</h3>
                <p className="text-blue-100">Ketik program studimu dan topik apa yang paling kamu sukai atau kuasai.</p>
              </FadeIn>
              <FadeIn delay={400} className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-black text-blue-600 shadow-xl mb-6">2</div>
                <h3 className="text-xl font-bold mb-3">Biar AI Bekerja</h3>
                <p className="text-blue-100">AI akan meracik kombinasi judul, metode, dan masalah yang *fresh* secara instan.</p>
              </FadeIn>
              <FadeIn delay={600} className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-black text-blue-600 shadow-xl mb-6">3</div>
                <h3 className="text-xl font-bold mb-3">Konsul & ACC</h3>
                <p className="text-blue-100">Bawa hasil rekomendasi ke Dosen Pembimbingmu dengan penuh percaya diri.</p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* 5. CTA (Call To Action) */}
        <section className="py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <FadeIn>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Sudah Siap Pakai Toga?</h2>
              <p className="text-xl text-slate-600 mb-10">Jangan biarkan skripsi menunda karir dan masa depanmu. Mulai temukan judulmu sekarang, mumpung masih gratis!</p>
              <Link href="/generator" className="inline-block rounded-2xl bg-amber-400 px-10 py-5 text-xl font-extrabold text-slate-900 shadow-xl shadow-amber-400/30 transition-transform hover:scale-105 active:scale-95">
                🔥 Coba Generator Sekarang
              </Link>
            </FadeIn>
          </div>
        </section>

      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 text-center">
        <p className="text-slate-500 font-medium">
          © {new Date().getFullYear()} Maululus.com. Dibuat dengan 💙 agar kamu cepat wisuda.
        </p>
      </footer>
    </div>
  );
}