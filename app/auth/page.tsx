'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase'; // Pastikan path ini sesuai dengan file supabase.ts kamu
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // Toggle antara Login dan Register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        // Proses Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Jika sukses login, arahkan ke halaman generator
        router.push('/dashboard');
        
      } else {
        // Proses Register (Daftar Akun Baru)
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // Pindah otomatis ke mode login setelah sukses daftar
        setSuccessMsg('Akun berhasil dibuat! Silakan login untuk melanjutkan.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Terjadi kesalahan saat autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans relative overflow-hidden">
      
      {/* Efek Latar Belakang */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 relative z-10">
        
        {/* Tombol Back */}
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-blue-600 mb-8 transition-colors">
          ← Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-extrabold text-blue-700 tracking-tight mb-2">
            Mau<span className="text-blue-500">lulus</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isLogin ? 'Selamat Datang Kembali 👋' : 'Mulai Perjalananmu 🚀'}
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            {isLogin ? 'Masuk ke akunmu untuk melihat kerangka skripsi.' : 'Daftar sekarang dan dapatkan 1 Koin Gratis!'}
          </p>
        </div>

        {/* Notifikasi Pesan */}
        {errorMsg && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            <span className="font-bold">Gagal: </span> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm text-green-600 border border-green-100">
            <span className="font-bold">Berhasil: </span> {successMsg}
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
            <input 
              type="email" 
              placeholder="nama@email.com" 
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="Minimal 6 karakter" 
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full rounded-2xl bg-blue-600 p-4 mt-2 text-white font-bold tracking-wide hover:bg-blue-700 disabled:opacity-70 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
          >
            {isLoading 
              ? 'Memproses...' 
              : isLogin ? 'Masuk Sekarang' : 'Daftar Akun Baru'
            }
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-8 text-center text-sm text-slate-500">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="font-bold text-amber-500 hover:text-amber-600 transition-colors"
          >
            {isLogin ? 'Daftar di sini' : 'Login di sini'}
          </button>
        </div>

      </div>
    </div>
  );
}