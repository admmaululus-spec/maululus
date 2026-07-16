// app/components/CookieBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Cek apakah user sudah pernah menyetujui cookies sebelumnya
    const consent = localStorage.getItem('maululus_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    // Simpan persetujuan di localStorage agar popup tidak muncul lagi selama 1 tahun
    localStorage.setItem('maululus_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-10 duration-700">
      <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
        
        <div className="flex items-start gap-4">
          <div className="text-3xl hidden sm:block">🍪</div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Website ini menggunakan Cookies</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              Kami menggunakan kuki (cookies) esensial untuk menjaga sesi login Anda dan membatasi penggunaan fitur gratis demi keamanan. Dengan melanjutkan navigasi di situs ini, Anda menyetujui penggunaan kuki kami. 
              Baca selengkapnya di <Link href="/kebijakan-privasi" className="text-blue-600 font-semibold hover:underline">Kebijakan Privasi</Link> kami.
            </p>
          </div>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3 shrink-0">
          {/* Tombol Terima */}
          <button 
            onClick={handleAccept}
            className="w-full md:w-auto bg-[#0f2a4a] hover:bg-slate-800 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            Mengerti & Lanjutkan
          </button>
        </div>

      </div>
    </div>
  );
}