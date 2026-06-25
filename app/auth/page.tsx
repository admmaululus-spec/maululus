'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// CLIENT ID GOOGLE KAMU
const GOOGLE_CLIENT_ID = "760830284212-o7knpcdpv4j9bjuvuu92annqin18vt96.apps.googleusercontent.com";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // States Form
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false); 
  
  // States Loading & Notifikasi
  const [isLoading, setIsLoading] = useState(true); 
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // State untuk Fitur Resend Email
  const [showResend, setShowResend] = useState(false);
  const [resendEmailTarget, setResendEmailTarget] = useState('');

  // Cek sesi saat halaman dimuat
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
      } else {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [router]);

  // ✨ HELPER: Smart Routing untuk menghindari duplikasi kode ✨
  const routeUserBasedOnRole = async (userId: string) => {
    // FIX: Gunakan maybeSingle() alih-alih single(). 
    // Pada pengguna baru, tabel profiles mungkin belum terbuat seketika oleh trigger. 
    // maybeSingle() akan me-return null (tidak melempar error throw) jika baris belum ada.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle(); 

    if (profileError) {
      console.error("Gagal mengambil profil:", profileError);
    }

    const role = profile?.role?.toLowerCase();

    if (role === 'admin') {
      router.replace('/admin'); 
    } else if (role === 'analyst' || role === 'analis') {
      router.replace('/admin/analis');
    } else {
      router.replace('/dashboard');
    }
  };

  // Handler Login/Register Email & Password
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setShowResend(false);

    let isNavigating = false; // Flag mencegah tombol aktif sebelum halaman berganti

    try {
      if (isLogin) {
        // --- PROSES LOGIN ---
        const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setShowResend(true);
            setResendEmailTarget(email);
            throw new Error('Email belum dikonfirmasi. Silakan cek kotak masuk/spam email Anda.');
          }
          throw error;
        }

        if (authData.session) {
          isNavigating = true;
          await routeUserBasedOnRole(authData.session.user.id);
        }

      } else {
        // --- PROSES REGISTER ---
        if (password !== confirmPassword) {
          throw new Error('Password dan Konfirmasi Password tidak cocok!');
        }
        if (!whatsapp.startsWith('08') && !whatsapp.startsWith('62')) {
          throw new Error('Nomor WhatsApp tidak valid (Gunakan awalan 08... atau 62...)');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { whatsapp: whatsapp } }
        });
        
        if (error) throw error;

        // Jika auto-login via signUp aktif (Confirm Email disabled di dashboard Supabase)
        if (data.session) {
          isNavigating = true;
          await routeUserBasedOnRole(data.session.user.id);
          return;
        }
        
        setSuccessMsg('Pendaftaran berhasil! Silakan cek Email Anda untuk mengaktifkan akun.');
        setIsLogin(true); 
        
        setShowResend(true);
        setResendEmailTarget(email);
        
        setPassword('');
        setConfirmPassword('');
        setWhatsapp('');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Terjadi kesalahan saat autentikasi.');
    } finally {
      // Hanya matikan loading jika tidak sedang dialihkan (menghindari UI berkedip)
      if (!isNavigating) {
        setIsLoading(false);
      }
    }
  };

  // Handler Kirim Ulang Email Konfirmasi
  const handleResendEmail = async () => {
    if (!resendEmailTarget) return;
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmailTarget,
      });

      if (error) throw error;
      setSuccessMsg(`Email konfirmasi telah dikirim ulang ke ${resendEmailTarget}. Silakan cek kotak masuk/spam.`);
      setShowResend(false); 
    } catch (error: any) {
      setErrorMsg(error.message || 'Gagal mengirim ulang email. Silakan coba beberapa saat lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✨ HANDLER BARU: Login Google via ID Token
  const handleGoogleSuccess = async (credentialResponse: any) => {
    let isNavigating = false;
    
    try {
      setIsLoading(true);
      setErrorMsg('');
      
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });

      if (error) throw error;

      if (data.session) {
        isNavigating = true;
        await routeUserBasedOnRole(data.session.user.id);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Gagal masuk dengan Google.');
    } finally {
      if (!isNavigating) {
        setIsLoading(false);
      }
    }
  };

  if (isLoading && !email && !password) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 my-8">
          
          {/* Tombol Back */}
          <Link href="/" className="inline-block text-[10px] font-bold text-slate-400 hover:text-slate-900 mb-10 transition-colors uppercase tracking-widest">
            ← Kembali
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="text-xl font-bold tracking-tight text-slate-900 uppercase mb-1">
              Maululus
            </div>
            <p className="text-slate-400 text-sm">
              {isLogin ? 'Masuk ke ruang kerjamu.' : 'Buat akun untuk memulai.'}
            </p>
          </div>

          {/* Notifikasi Pesan */}
          {errorMsg && (
            <div className="mb-4 rounded-xl bg-red-50 p-4 text-xs text-red-600 border border-red-100 leading-relaxed animate-in fade-in zoom-in-95">
              <span className="font-bold">Gagal: </span> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 rounded-xl bg-green-50 p-4 text-xs text-green-600 border border-green-100 leading-relaxed animate-in fade-in zoom-in-95">
              <span className="font-bold">Berhasil: </span> {successMsg}
            </div>
          )}

          {/* Fitur Kirim Ulang Email */}
          {showResend && (
            <button 
              type="button"
              onClick={handleResendEmail}
              disabled={isLoading}
              className="mb-6 w-full rounded-xl bg-indigo-50 p-3 text-xs font-bold text-indigo-600 border border-indigo-100 hover:bg-indigo-100 hover:text-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
              Belum terima? Kirim Ulang Email Konfirmasi
            </button>
          )}

          {/* Form Input Manual */}
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Kampus / Pribadi</label>
              <input 
                type="email" 
                placeholder="nama@email.com" 
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none transition-all focus:border-slate-400 focus:bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nomor WhatsApp</label>
                <input 
                  type="number" 
                  placeholder="081234567890" 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none transition-all focus:border-slate-400 focus:bg-white"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[9px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
                >
                  {showPassword ? 'Tutup' : 'Lihat'}
                </button>
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Minimal 6 karakter" 
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none transition-all focus:border-slate-400 focus:bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Konfirmasi Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Ketik ulang password" 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none transition-all focus:border-slate-400 focus:bg-white"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full rounded-xl bg-slate-900 p-4 mt-6 text-white text-sm font-bold tracking-wide hover:bg-slate-800 disabled:opacity-70 transition-all flex justify-center items-center active:scale-[0.98]"
            >
              {isLoading && email 
                ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-white"></div>
                : isLogin ? 'Masuk dengan Email' : 'Daftar Sekarang'
              }
            </button>
          </form>

          {/* Pemisah (ATAU) */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Atau</span>
            </div>
          </div>

          {/* TOMBOL LOGIN GOOGLE */}
          <div className="mt-8 flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMsg('Login dengan Google dibatalkan atau gagal.')}
              useOneTap={false}
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
              width="100%"
            />
          </div>

          {/* Toggle Login/Register */}
          <div className="mt-8 pt-8 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg('');
                setSuccessMsg('');
                setPassword('');
                setConfirmPassword('');
                setShowResend(false);
              }}
              className="font-bold text-slate-900 hover:underline transition-all"
            >
              {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </div>

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}