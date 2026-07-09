'use client';

import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col scale-in-95 animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="text-2xl font-extrabold text-[#0f2a4a] mb-3">Akses Terbatas</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-8">
            Silakan <b className="text-slate-700">Daftar</b> atau <b className="text-slate-700">Masuk</b> terlebih dahulu untuk melakukan pemesanan dan mengakses dashboard pengerjaan proyek Kamu.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push('/auth')} 
              className="w-full bg-[#0f2a4a] text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              Masuk / Daftar Sekarang
            </button>
            <button 
              onClick={onClose} 
              className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}