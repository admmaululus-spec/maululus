'use client';
import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '../dashboard/components/IconsAndUI'; // Sesuaikan path jika perlu

export default function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Animasi loading akan tampil selama 1.5 detik sebelum masuk ke beranda
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1525] transition-opacity duration-500">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
        <div className="relative flex items-center justify-center w-20 h-20 bg-blue-600/20 rounded-full">
          <div className="absolute w-full h-full border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-blue-500 text-3xl animate-pulse">
            <SparklesIcon />
          </span>
        </div>
        <div className="text-center">
          <h2 className="text-white text-2xl font-black tracking-widest mb-2 animate-pulse">MAULULUS</h2>
          <p className="text-slate-400 text-sm font-medium">Menyiapkan ruang kerja Anda...</p>
        </div>
      </div>
    </div>
  );
}