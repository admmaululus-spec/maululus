'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

type Promo = { 
  id: string; 
  title: string; 
  description: string; 
  target_criteria: string; 
  reward_amount: number; 
  is_active: boolean;
  action_link?: string;
  action_button_text?: string;
};

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetCriteria, setTargetCriteria] = useState('empty_whatsapp');
  const [rewardAmount, setRewardAmount] = useState(5);
  
  // State Baru untuk Custom Button
  const [actionButtonText, setActionButtonText] = useState('');
  const [actionLink, setActionLink] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const fetchPromos = async () => {
    const { data } = await supabase.from('promos').select('*').order('created_at', { ascending: false });
    if (data) setPromos(data);
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return alert("Isi Judul dan Deskripsi!");
    setIsLoading(true);

    const { error } = await supabase.from('promos').insert([{
      title, 
      description, 
      target_criteria: targetCriteria, 
      reward_amount: rewardAmount, 
      is_active: true,
      action_button_text: actionButtonText.trim() || null,
      action_link: actionLink.trim() || null
    }]);

    if (error) {
      alert("Gagal membuat promo: " + error.message);
    } else {
      alert("Promo baru berhasil diterbitkan!");
      setTitle(''); setDescription(''); setActionButtonText(''); setActionLink('');
      fetchPromos();
    }
    setIsLoading(false);
  };

  const togglePromoStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('promos').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) fetchPromos();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-12 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Management Pop-Up Promo</h1>
          <p className="text-slate-500 text-xs mt-1">Buat kempen penawaran koin gratis terarah untuk mahasiswa.</p>
        </div>

        {/* FORM BUAT PROMO */}
        <form onSubmit={handleCreatePromo} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Buat Promo Baru</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Judul Pop-Up Promo</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Bonus 5 Koin Menantimu!" className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-slate-400" required/>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hadiah (Jumlah Koin)</label>
              <input type="number" value={rewardAmount} onChange={(e) => setRewardAmount(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-slate-400" required min={0}/>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kriteria Target Pengguna</label>
            <select value={targetCriteria} onChange={(e) => setTargetCriteria(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3.5 text-sm bg-slate-50 outline-none focus:border-slate-400 font-medium">
              <option value="empty_whatsapp">Khusus Pengguna yang Nomor WhatsApp-nya Masih Kosong</option>
              <option value="all_users">Semua Pengguna Tanpa Syarat (Promo Hari Besar)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Isi Deskripsi Promo</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Masukkan kalimat ajakan persuasif..." rows={2} className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-slate-400 resize-none" required/>
          </div>

          {/* ✨ INPUT BARU: CUSTOM BUTTON LINK ✨ */}
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-indigo-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" /><path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" /></svg>
              Tombol Aksi Kustom (Opsional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Teks Tombol</label>
                <input type="text" value={actionButtonText} onChange={(e) => setActionButtonText(e.target.value)} placeholder="Contoh: Gabung Grup Telegram" className="w-full rounded-xl border border-white p-3 text-sm outline-none focus:border-indigo-300"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Link Tujuan (URL)</label>
                <input type="url" value={actionLink} onChange={(e) => setActionLink(e.target.value)} placeholder="https://t.me/maululus" className="w-full rounded-xl border border-white p-3 text-sm outline-none focus:border-indigo-300"/>
              </div>
            </div>
            <p className="text-[10px] text-indigo-500 italic">*Biarkan kosong jika tidak ingin menampilkan tombol kustom ini di pop-up.</p>
          </div>

          <button type="submit" disabled={isLoading} className="bg-slate-900 text-white text-xs font-bold py-4 px-6 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 mt-2">
            {isLoading ? 'Menerbitkan...' : 'TERBITKAN POP-UP PROMO'}
          </button>
        </form>

        {/* DAFTAR PROMO YANG ADA */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Daftar Promo Aktif</h2>
          <div className="divide-y divide-slate-100">
            {promos.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 italic">Belum ada aktivitas campaign promo.</p>
            ) : (
              promos.map((p) => (
                <div key={p.id} className="py-4 flex justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{p.title} <span className="ml-2 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-[10px] font-bold">+{p.reward_amount} Koin</span></h4>
                    <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                    <div className="flex gap-3 mt-1.5">
                      <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Target: {p.target_criteria === 'empty_whatsapp' ? 'WA Kosong' : 'Semua User'}</p>
                      {p.action_link && <p className="text-[9px] font-bold uppercase text-indigo-500 tracking-wider flex items-center gap-1">🔗 Ada Tombol Kustom</p>}
                    </div>
                  </div>
                  <button onClick={() => togglePromoStatus(p.id, p.is_active)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${p.is_active ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}>
                    {p.is_active ? 'AKTIF' : 'NONAKTIF'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}