'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

type Promo = { id: string; title: string; description: string; target_criteria: string; reward_amount: number; is_active: boolean; };

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetCriteria, setTargetCriteria] = useState('empty_whatsapp');
  const [rewardAmount, setRewardAmount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPromos = async () => {
    const { data } = await supabase.from('promos').select('*').order('created_at', { ascending: false });
    if (data) setPromos(data);
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return alert("Isi semua kolom!");
    setIsLoading(true);

    const { error } = await supabase.from('promos').insert([{
      title, description, target_criteria: targetCriteria, reward_amount: rewardAmount, is_active: true
    }]);

    if (error) {
      alert("Gagal membuat promo: " + error.message);
    } else {
      alert("Promo baru berhasil diterbitkan!");
      setTitle(''); setDescription('');
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
              <input type="number" value={rewardAmount} onChange={(e) => setRewardAmount(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-slate-400" required min={1}/>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kriteria Target Pengguna (Dropdown Kriteria)</label>
            <select value={targetCriteria} onChange={(e) => setTargetCriteria(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3.5 text-sm bg-slate-50 outline-none focus:border-slate-400 font-medium">
              <option value="empty_whatsapp">Khusus Pengguna yang Nomor WhatsApp-nya Masih Kosong</option>
              <option value="all_users">Semua Pengguna Tanpa Syarat (Promo Hari Besar)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Isi Deskripsi Promo</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Masukkan kalimat ajakan persuasif agar mahasiswa mau mengklaim..." rows={3} className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-slate-400 resize-none" required/>
          </div>

          <button type="submit" disabled={isLoading} className="bg-slate-900 text-white text-xs font-bold py-4 px-6 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50">
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
                    <p className="text-[9px] font-bold uppercase text-indigo-500 tracking-wider mt-1">Target: {p.target_criteria === 'empty_whatsapp' ? 'WA Kosong' : 'Semua User'}</p>
                  </div>
                  <button onClick={() => togglePromoStatus(p.id, p.is_active)} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${p.is_active ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}>
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