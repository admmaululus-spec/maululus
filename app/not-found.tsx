import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 font-sans relative overflow-hidden text-[#0f2a4a]">
      
      {/* Efek Glow Hijau di Background */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-[100px]"></div>

      <div className="max-w-md text-center z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Teks 404 Raksasa */}
        <h1 className="text-9xl font-black text-slate-200 drop-shadow-sm mb-2 tracking-tighter">
          4<span className="text-green-500">0</span>4
        </h1>
        
        {/* Judul & Pesan Ala Skripsian */}
        <h2 className="text-3xl font-extrabold mb-4 tracking-tight">
          Waduh, Kamu Nyasar!
        </h2>
        
        <p className="text-slate-500 mb-10 leading-relaxed font-medium">
          Halaman yang kamu cari tidak ditemukan. Sama seperti nyari referensi jurnal yang susah ketemu, sepertinya halaman ini sudah dihapus atau pindah alamat.
        </p>
        
        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-600 hover:-translate-y-1 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Kembali ke Beranda
          </Link>
          
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-8 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
          >
            Masuk Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}