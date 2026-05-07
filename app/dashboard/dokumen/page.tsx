'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

type SubBab = { judul: string; deskripsi: string };
type OutlineData = { bab: string; subBab: SubBab[] };

function DokumenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idSkripsi = searchParams.get('id'); 
  
  const [judulTarget, setJudulTarget] = useState<string>('');
  const [outline, setOutline] = useState<OutlineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!idSkripsi) {
      router.push('/dashboard');
      return;
    }

    const fetchDokumen = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('history_skripsi')
        .select('*')
        .eq('id', idSkripsi)
        .eq('user_id', session.user.id) 
        .single();

      if (error || !data) {
        alert("Dokumen tidak ditemukan.");
        router.push('/dashboard');
      } else if (!data.is_unlocked) {
        alert("Dokumen ini masih terkunci.");
        router.push('/dashboard');
      } else {
        setJudulTarget(data.judul);
        setOutline(data.outline);
        setIsLoading(false);
      }
    };

    fetchDokumen();
  }, [idSkripsi, router]);

  // 1. FUNGSI COPY TEXT (Asli)
  const handleCopy = () => {
    let textToCopy = `JUDUL SKRIPSI:\n${judulTarget}\n\n`;
    outline.forEach(item => {
      textToCopy += `${item.bab}\n`;
      item.subBab?.forEach(sub => {
        textToCopy += `\n${sub.judul}\n${sub.deskripsi}\n`;
      });
      textToCopy += `\n----------------------------------------\n\n`;
    });
    navigator.clipboard.writeText(textToCopy);
    alert('Dokumen berhasil disalin!');
  };

  // 2. FUNGSI DOWNLOAD WORD (.doc)
  const handleDownloadWord = () => {
    // Membuat struktur HTML yang dikenali oleh Microsoft Word
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${judulTarget}</title>
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.5; }
          h1 { text-align: center; text-transform: uppercase; font-size: 16pt; margin-bottom: 24pt; }
          h2 { text-transform: uppercase; font-size: 14pt; margin-top: 24pt; color: #000; }
          h3 { font-size: 12pt; margin-top: 12pt; color: #000; }
          p { text-align: justify; font-size: 12pt; margin-bottom: 12pt; }
        </style>
      </head>
      <body>
        <h1>${judulTarget}</h1>
    `;

    outline.forEach(item => {
      htmlContent += `<h2>${item.bab}</h2>`;
      item.subBab?.forEach(sub => {
        htmlContent += `<h3>${sub.judul}</h3>`;
        htmlContent += `<p>${sub.deskripsi}</p>`;
      });
    });

    htmlContent += `
        <br><hr>
        <p style="text-align: center; font-size: 10pt; color: #666;">Di-generate secara otomatis oleh Maululus AI</p>
      </body></html>
    `;

    // Mengubah HTML menjadi file MS Word (Blob)
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Bersihkan judul untuk nama file (buang karakter aneh)
    const safeJudul = judulTarget.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
    link.download = `Skripsi_${safeJudul}.doc`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. FUNGSI DOWNLOAD PDF (Memicu window.print)
  const handleDownloadPDF = () => {
    window.print();
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div></div>;

  return (
    // Class "print:bg-white" memastikan background jadi putih murni saat di-print ke PDF
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 print:bg-white print:pb-0">
      
      {/* HEADER NAVIGASI (Disembunyikan saat cetak PDF menggunakan print:hidden) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto px-6 h-auto py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/dashboard" className="text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-2 self-start sm:self-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m15 18-6-6 6-6"/></svg>
            Kembali
          </Link>
          
          {/* Grup Tombol Aksi */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button onClick={handleCopy} className="flex-1 sm:flex-none justify-center text-sm font-bold bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy
            </button>
            <button onClick={handleDownloadPDF} className="flex-1 sm:flex-none justify-center text-sm font-bold bg-red-50 text-red-700 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 border border-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M10 18v-6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v6"/><path d="M10 14h4"/></svg>
              PDF
            </button>
            <button onClick={handleDownloadWord} className="flex-1 sm:flex-none justify-center text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
              Export Word
            </button>
          </div>
        </div>
      </header>

      {/* KERTAS DOKUMEN (Dioptimalkan untuk Print) */}
      <main className="max-w-4xl mx-auto px-6 pt-10 print:pt-0 print:px-0">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-8 sm:p-14 print:border-none print:shadow-none print:rounded-none print:p-0">
          
          <div className="text-center border-b-2 border-slate-100 pb-8 mb-10 print:border-b-0 print:pb-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 mb-6 border border-green-100 print:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>
              Dokumen Resmi Maululus
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug max-w-2xl mx-auto uppercase print:text-2xl">
              {judulTarget}
            </h1>
          </div>

          <div className="space-y-12 print:space-y-6">
            {outline.map((item, index) => (
              <div key={index} className="space-y-6 print:space-y-4">
                <h2 className={`text-2xl font-extrabold border-b-2 pb-2 inline-block print:text-black print:border-b-0 print:border-black print:pb-1 ${item.bab.includes('REFERENSI') || item.bab.includes('📚') ? 'text-amber-600 border-amber-200' : 'text-blue-800 border-blue-100'}`}>
                  {item.bab}
                </h2>
                
                <div className="space-y-4 print:space-y-2">
                  {item.subBab?.map((sub, subIdx) => (
                    // print:bg-transparent menghilangkan background abu-abu saat di PDF
                    <div key={subIdx} className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-100 print:bg-transparent print:border-none print:p-0">
                      <h3 className="text-lg font-bold text-slate-800 mb-2 print:text-black">{sub.judul}</h3>
                      <p className="text-slate-600 leading-relaxed text-justify text-sm sm:text-base print:text-black mb-3">
                        {sub.deskripsi}
                      </p>

                      {/* TOMBOL GOOGLE SCHOLAR - Sembunyi saat diprint */}
                      <a 
                        href={`https://scholar.google.com/scholar?q=${encodeURIComponent(judulTarget + ' ' + sub.judul)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-all w-fit print:hidden"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        Cari Referensi di Google Scholar
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm font-medium print:mt-10 print:pt-4">
            Dokumen ini di-*generate* secara otomatis oleh Maululus AI. <br className="print:hidden"/>
            Selalu konsultasikan kembali dengan Dosen Pembimbing Anda.
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DokumenSkripsiPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50"></div>}>
      <DokumenContent />
    </Suspense>
  );
}