'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function PromoPopup() {
  const [activePromo, setActivePromo] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [whatsappInput, setWhatsappInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkEligiblePromo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase.from('users_data').select('*').eq('id', session.user.id).single();
      if (!profile) return;
      setUserProfile(profile);

      const { data: activePromos } = await supabase.from('promos').select('*').eq('is_active', true);
      if (!activePromos || activePromos.length === 0) return;

      for (const promo of activePromos) {
        const { data: alreadyClaimed } = await supabase
          .from('promo_claims')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('promo_id', promo.id)
          .maybeSingle();

        if (!alreadyClaimed) {
          if (promo.target_criteria === 'all_users') {
            setActivePromo(promo);
            setIsOpen(true);
            break; 
          } else if (promo.target_criteria === 'empty_whatsapp' && (!profile.whatsapp || profile.whatsapp.trim() === '')) {
            setActivePromo(promo);
            setIsOpen(true);
            break;
          }
        }
      }
    };

    checkEligiblePromo();
  }, []);

  const handleClaimReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePromo || !userProfile) return;
    setIsProcessing(true);

    try {
      if (activePromo.target_criteria === 'empty_whatsapp') {
        if (!whatsappInput.startsWith('08') && !whatsappInput.startsWith('62')) {
          alert('Nomor WhatsApp wajib valid (Gunakan awalan 08 atau 62)');
          setIsProcessing(false);
          return;
        }
        
        const { error: updateError } = await supabase
          .from('users_data')
          .update({ whatsapp: whatsappInput })
          .eq('id', userProfile.id);
          
        if (updateError) throw updateError;
      }

      // Berikan koin hanya jika nominal reward lebih besar dari 0
      if (activePromo.reward_amount > 0) {
        const totalNewCoins = (userProfile.coins || 0) + activePromo.reward_amount;
        const { error: coinError } = await supabase
          .from('users_data')
          .update({ coins: totalNewCoins })
          .eq('id', userProfile.id);

        if (coinError) throw coinError;
      }

      await supabase.from('promo_claims').insert([{ user_id: userProfile.id, promo_id: activePromo.id }]);

      if (activePromo.reward_amount > 0) {
        alert(`Selamat! Anda berhasil mendapatkan bonus ${activePromo.reward_amount} koin gratis.`);
      } else {
        alert(`Terima kasih telah berpartisipasi!`);
      }
      
      setIsOpen(false);
      window.location.reload(); 

    } catch (err: any) {
      alert('Gagal mengklaim reward: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !activePromo) return null;

  // Normalisasi URL agar aman diklik
  const getSafeUrl = (url: string) => {
    if (!url) return '#';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 text-center shadow-2xl border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-emerald-500 animate-bounce">
            <path d="M10.744 2.22a.75.75 0 01.512.694v6.155a.75.75 0 01-1.5 0V4.316l-3.22 3.22a.75.75 0 01-1.06-1.06l4.5-4.5a.75.75 0 01.768-.256zm2.512.694a.75.75 0 011.268-.438l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V9.07a.75.75 0 01-1.5 0V2.914zM4.5 10.5a.75.75 0 00-.75.75v7.5c0 1.243 1.007 2.25 2.25 2.25h12a2.25 2.25 0 002.25-2.25v-7.5a.75.75 0 00-.75-.75h-15z" />
          </svg>
        </div>

        <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[9px] font-extrabold text-indigo-600 tracking-widest uppercase">Spesial Penawaran</span>
        <h3 className="text-xl font-black text-slate-900 mt-3 leading-snug">{activePromo.title}</h3>
        <p className="text-slate-400 text-xs mt-2 leading-relaxed px-2">{activePromo.description}</p>

        {/* ✨ TOMBOL KUSTOM OPSIONAL MUNCUL DI SINI ✨ */}
        {activePromo.action_link && activePromo.action_button_text && (
          <div className="mt-4">
            <a 
              href={getSafeUrl(activePromo.action_link)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2.5 px-6 rounded-full text-xs transition-colors border border-indigo-100 w-auto mx-auto"
            >
              {activePromo.action_button_text}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
          </div>
        )}

        <form onSubmit={handleClaimReward} className="mt-6 space-y-3">
          {activePromo.target_criteria === 'empty_whatsapp' && (
            <div className="space-y-1 text-left animate-in slide-in-from-bottom-2">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">Masukkan No. WhatsApp Aktif</label>
              <input 
                type="number" 
                placeholder="Contoh: 0812345678xx" 
                value={whatsappInput}
                onChange={(e) => setWhatsappInput(e.target.value)}
                className="w-full text-center font-bold rounded-xl border border-slate-200 p-3.5 text-sm outline-none text-slate-800 bg-slate-50 focus:bg-white focus:border-slate-400 transition-all"
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isProcessing} 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {isProcessing ? 'Memproses...' : (activePromo.reward_amount > 0 ? `KLAIM BONUS +${activePromo.reward_amount} KOIN` : 'SELESAI & TUTUP')}
          </button>
          
          <button 
            type="button" 
            onClick={() => setIsOpen(false)} 
            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 pt-2 transition-colors block mx-auto"
          >
            Lewati Sekarang
          </button>
        </form>
      </div>
    </div>
  );
}