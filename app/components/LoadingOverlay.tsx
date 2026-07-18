'use client';
import React, { useState, useEffect } from 'react';

export default function LoadingOverlay() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 1. Mulai animasi memudar (fade out) setelah 1.5 detik
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1500);

    // 2. Hapus komponen dari DOM sepenuhnya setelah animasi fade-out selesai (2 detik)
    const unmountTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-all duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* LOGO MAULULUS */}
        <div className="relative mb-12 flex justify-center">
          {/* Efek Glow di belakang logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-100/50 rounded-full blur-3xl animate-pulse"></div>
          
          <img 
            src="/logo.png" // SESUAIKAN DENGAN NAMA FILE LOGO ANDA DI FOLDER PUBLIC
            alt="Maululus Logo" 
            className="w-56 md:w-64 h-auto object-contain relative z-10"
          />
        </div>

        {/* ANIMASI SPINNER PREMIUM (Warna Navy & Hijau) */}
        <div className="relative flex items-center justify-center w-14 h-14 mb-8">
          {/* Cincin Luar (Navy) */}
          <div className="absolute inset-0 border-[3px] border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-[3px] border-[#0f2a4a] border-t-transparent border-r-transparent rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
          
          {/* Cincin Dalam (Hijau) */}
          <div className="absolute inset-2 border-[3px] border-green-500/20 rounded-full"></div>
          <div className="absolute inset-2 border-[3px] border-green-500 border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          
          {/* Titik Tengah */}
          <div className="w-2 h-2 bg-[#0f2a4a] rounded-full animate-ping"></div>
        </div>

        {/* TEKS LOADING */}
        <div className="text-center">
          <h2 className="text-[#0f2a4a] text-lg font-black tracking-widest uppercase mb-1.5">
           Menyiapkan Engine AI Maululus
          </h2>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase animate-pulse">
            Mohon Tunggu Sebentar...
          </p>
        </div>

      </div>
    </div>
  );
}