import Link from 'next/link';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthHandler } from '../hooks/useAuthHandler';

export default function AuthForm() {
  // Memanggil semua state dan fungsi dari Custom Hook
  const auth = useAuthHandler();

  if (auth.isLoading && !auth.email && !auth.password) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 my-8">
        
        <Link href="/" className="inline-block text-[10px] font-bold text-slate-400 hover:text-slate-900 mb-10 transition-colors uppercase tracking-widest">
          ← Kembali
        </Link>

        <div className="mb-8">
          <div className="text-xl font-bold tracking-tight text-slate-900 uppercase mb-1">Maululus</div>
          <p className="text-slate-400 text-sm">{auth.isLogin ? 'Masuk ke ruang kerjamu.' : 'Buat akun untuk memulai.'}</p>
        </div>

        {auth.errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-xs text-red-600 border border-red-100 leading-relaxed animate-in fade-in zoom-in-95">
            <span className="font-bold">Gagal: </span> {auth.errorMsg}
          </div>
        )}
        {auth.successMsg && (
          <div className="mb-4 rounded-xl bg-green-50 p-4 text-xs text-green-600 border border-green-100 leading-relaxed animate-in fade-in zoom-in-95">
            <span className="font-bold">Berhasil: </span> {auth.successMsg}
          </div>
        )}

        {auth.showResend && (
          <button 
            onClick={auth.handleResendEmail} 
            disabled={auth.isLoading} 
            className="mb-6 w-full rounded-xl bg-indigo-50 p-3 text-xs font-bold text-indigo-600 border border-indigo-100 hover:bg-indigo-100 hover:text-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Belum terima? Kirim Ulang Email Konfirmasi
          </button>
        )}

        <form onSubmit={auth.handleAuth} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer">Email Kampus / Pribadi</label>
            <input 
              id="email"
              type="email" 
              placeholder="nama@email.com" 
              value={auth.email} 
              onChange={(e) => auth.setEmail(e.target.value)} 
              disabled={auth.isLoading}
              required 
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-all disabled:opacity-60" 
            />
          </div>

          {!auth.isLogin && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label htmlFor="whatsapp" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer">Nomor WhatsApp</label>
              <input 
                id="whatsapp"
                type="tel" 
                placeholder="081234567890" 
                value={auth.whatsapp} 
                onChange={(e) => auth.setWhatsapp(e.target.value)} 
                disabled={auth.isLoading}
                required 
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-all disabled:opacity-60" 
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer">Password</label>
              <button 
                type="button" 
                onClick={() => auth.setShowPassword(!auth.showPassword)} 
                className="text-[9px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest"
              >
                {auth.showPassword ? 'Tutup' : 'Lihat'}
              </button>
            </div>
            <input 
              id="password"
              type={auth.showPassword ? "text" : "password"} 
              placeholder="Minimal 6 karakter" 
              value={auth.password} 
              onChange={(e) => auth.setPassword(e.target.value)} 
              disabled={auth.isLoading}
              required 
              minLength={6} 
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-all disabled:opacity-60" 
            />
          </div>

          {!auth.isLogin && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label htmlFor="confirmPassword" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer">Konfirmasi Password</label>
              <input 
                id="confirmPassword"
                type={auth.showPassword ? "text" : "password"} 
                placeholder="Ketik ulang password" 
                value={auth.confirmPassword} 
                onChange={(e) => auth.setConfirmPassword(e.target.value)} 
                disabled={auth.isLoading}
                required 
                minLength={6} 
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-all disabled:opacity-60" 
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={auth.isLoading} 
            className="w-full rounded-xl bg-slate-900 p-4 mt-6 text-white text-sm font-bold tracking-wide hover:bg-slate-800 disabled:opacity-70 transition-all flex justify-center items-center active:scale-[0.98]"
          >
            {auth.isLoading && auth.email ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-white"></div>
            ) : auth.isLogin ? (
              'Masuk dengan Email'
            ) : (
              'Daftar Sekarang'
            )}
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white px-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Atau</span></div>
        </div>

        <div className="mt-8 flex justify-center w-full">
          <GoogleLogin
            onSuccess={auth.handleGoogleSuccess}
            onError={() => auth.setErrorMsg('Login dengan Google dibatalkan atau gagal.')}
            useOneTap={false} 
            theme="outline" 
            size="large" 
            shape="pill" 
            text="continue_with" 
          />
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
          {auth.isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button 
            type="button" 
            onClick={() => { 
              auth.setIsLogin(!auth.isLogin); 
              auth.setErrorMsg(''); 
              auth.setSuccessMsg(''); 
              auth.setPassword(''); 
              auth.setConfirmPassword(''); 
              auth.setShowResend(false); 
            }} 
            className="font-bold text-slate-900 hover:underline transition-all"
          >
            {auth.isLogin ? 'Daftar di sini' : 'Masuk di sini'}
          </button>
        </div>

      </div>
    </div>
  );
}