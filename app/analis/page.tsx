'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Analyst = {
  id: string;
  name: string;
  expertise: string;
  bio: string; // Akan kita pakai untuk field "Spesialisasi"
  price: number;
  photo_url: string;
  is_wa_enabled: boolean;
  wa_number: string;
};

export default function UserAnalystCatalog() {
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAnalysts = async () => {
      const { data, error } = await supabase
        .from('analyst_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAnalysts(data);
      }
      setIsLoading(false);
    };

    fetchAnalysts();
  }, []);

  const handleStartChat = async (analyst: Analyst) => {
    setIsProcessing(true); // Ubah tombol jadi "Memproses..."
    
    // 1. Cek User Session
    const { data: { session } } = await supabase.auth.getSession();
    
    // JIKA BELUM LOGIN: Langsung arahkan ke halaman auth secara senyap
    if (!session) {
      router.push('/auth');
      return; 
    }

    const userId = session.user.id;

    // 2. Cek Koin & Validasi
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('koin')
      .eq('id', userId)
      .single();

    // Jika sesi nyangkut tapi data di database tidak ada (seperti di screenshot Anda)
    if (profileError || !userProfile) {
      alert("Sesi tidak valid. Silakan login ulang.");
      await supabase.auth.signOut(); // Bersihkan sesi yang error
      setIsProcessing(false); // Kembalikan tombol ke "Mulai Konsultasi"
      router.push('/auth');
      return;
    }

    if (userProfile.koin < analyst.price) {
      alert(`Koin tidak cukup! Butuh ${analyst.price} koin, sisa koin Anda: ${userProfile.koin}.`);
      setIsProcessing(false); // Kembalikan tombol
      return;
    }

    // 3. Potong Koin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ koin: userProfile.koin - analyst.price })
      .eq('id', userId);
      
    if (updateError) { 
      alert("Terjadi kesalahan sistem saat memotong koin."); 
      setIsProcessing(false); // Kembalikan tombol
      return; 
    }

    // 4. Buat Sesi & Arahkan ke Ruang Chat
    const { data: chatSession, error: chatError } = await supabase
      .from('chat_sessions')
      .insert([{ user_id: userId, analyst_id: analyst.id, payment_status: 'paid', stage: 'Baru Mulai' }])
      .select()
      .single();

    if (chatError) { 
      alert("Gagal membuat ruang chat."); 
      setIsProcessing(false); // Kembalikan tombol
      return; 
    }
    
    // Sukses! Lanjut ke ruang chat
    router.push(`/chat/${chatSession.id}`);
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div></div>;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      
      {/* Tombol Kembali (Desain Sesuai Gambar) */}
      <div className="max-w-6xl mx-auto pt-8 px-6">
        <Link href="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-2">
          ← Kembali ke Beranda
        </Link>
      </div>

      {/* Header Utama */}
      <div className="text-center mt-12 mb-16 px-6">
        <h1 className="text-4xl md:text-[2.5rem] font-extrabold text-[#0D1C2E] tracking-tight mb-4">
          Konsultasi dengan <span className="text-emerald-500">Pakar Skripsi</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
          Diskusikan hasil generate judul AI atau matangkan kerangka skripsimu langsung dengan analis akademik profesional kami.
        </p>
      </div>

      {/* Grid Katalog Analis */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {analysts.map((analyst) => (
            <div key={analyst.id} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all flex flex-col h-full">
              
              {/* Identitas Analis */}
              <div className="flex items-center gap-4 mb-8">
                {analyst.photo_url ? (
                  <img src={analyst.photo_url} alt={analyst.name} className="h-16 w-16 rounded-full object-cover border border-slate-100" />
                ) : (
                  <div className="h-16 w-16 bg-[#0D1C2E] text-white rounded-full flex items-center justify-center text-xl font-bold tracking-widest">
                    {getInitials(analyst.name)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg text-[#0D1C2E] leading-tight">{analyst.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-slate-500">Tersedia ({analyst.price} Koin)</span>
                  </div>
                </div>
              </div>

              {/* Detail Spesialisasi */}
              <div className="space-y-4 flex-1">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Spesialisasi</p>
                  <p className="text-sm font-semibold text-slate-700">{analyst.bio || 'Akademik Umum'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pendidikan</p>
                  <p className="text-sm font-semibold text-slate-700">{analyst.expertise}</p>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="mt-8 space-y-3">
                <button 
                  onClick={() => handleStartChat(analyst)}
                  disabled={isProcessing}
                  className="w-full bg-[#0D1C2E] hover:bg-[#1a3556] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-70 text-sm"
                >
                  {isProcessing ? 'Memproses...' : 'Mulai Konsultasi'}
                </button>

                {analyst.is_wa_enabled && (
                  <a 
                    href={`https://wa.me/${analyst.wa_number.startsWith('0') ? '62' + analyst.wa_number.slice(1) : analyst.wa_number}?text=Halo ${analyst.name}, saya butuh bimbingan skripsi.`}
                    target="_blank" rel="noreferrer"
                    className="flex justify-center w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold py-3.5 rounded-xl transition-colors text-sm"
                  >
                    Hubungi via WhatsApp
                  </a>
                )}
              </div>

            </div>
          ))}

          {analysts.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-500 font-medium">
              Belum ada data analis yang diinputkan oleh Admin.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}