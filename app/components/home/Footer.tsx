'use client';

import Link from 'next/link';

export default function Footer() {
  return (
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

        <div>
          <h4 className="font-bold text-[#0f2a4a] mb-5">Hubungi Kami</h4>
          <ul className="space-y-4 text-sm text-slate-500">
            <li className="flex items-center gap-3">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              support@maululus.com
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              +62-821-2000-2589
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Kota Malang, Jawa Timur
            </li>
          </ul>
        </div>

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
        <div className="text-xs font-bold text-slate-300">Transaksi Aman Terlindungi via Midtrans</div>
      </div>
    </footer>
  );
}