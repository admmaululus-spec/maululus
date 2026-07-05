'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function PengaturanHargaPage() {
  const [loading, setLoading] = useState(true);
  const [koinRate, setKoinRate] = useState(500);
  const [coinPkgs, setCoinPkgs] = useState<any[]>([]);
  const [expertPkgs, setExpertPkgs] = useState<any[]>([]);
  const [aiTools, setAiTools] = useState<any[]>([]);

  // State untuk Modal Edit Paket
  const [editModal, setEditModal] = useState<{ show: boolean, type: 'coin' | 'expert', data: any }>({ show: false, type: 'coin', data: null });

  const fetchData = async () => {
    setLoading(true);
    const [rateRes, coinRes, expertRes, aiRes] = await Promise.all([
      supabase.from('app_settings').select('value').eq('key', 'koin_rate').single(),
      supabase.from('coin_packages').select('*').order('koin', { ascending: true }),
      supabase.from('expert_packages').select('*').order('harga', { ascending: true }),
      supabase.from('ai_tools_pricing').select('*').order('koin', { ascending: true })
    ]);

    if (rateRes.data) setKoinRate(parseInt(rateRes.data.value));
    if (coinRes.data) setCoinPkgs(coinRes.data);
    if (expertRes.data) setExpertPkgs(expertRes.data);
    if (aiRes.data) setAiTools(aiRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

  // 1. Fungsi Update Kurs Koin
  const handleUpdateKurs = async () => {
    const val = prompt("Masukkan harga rupiah untuk 1 Koin:", koinRate.toString());
    if (val && !isNaN(Number(val))) {
      await supabase.from('app_settings').update({ value: val }).eq('key', 'koin_rate');
      setKoinRate(Number(val));
      alert("Kurs Koin berhasil diupdate!");
    }
  };

  // 2. Fungsi Update Tarif AI Tools (Cepat via Prompt)
  const handleUpdateAiTarif = async (id: string, currentKoin: number, nama: string) => {
    const val = prompt(`Masukkan jumlah potongan koin baru untuk fitur ${nama}:`, currentKoin.toString());
    if (val && !isNaN(Number(val))) {
      await supabase.from('ai_tools_pricing').update({ koin: Number(val) }).eq('id', id);
      fetchData();
    }
  };

  // 3. Fungsi Set "Paling Populer" (Best Seller) Top Up Koin
  const handleSetBestSeller = async (id: string) => {
    await supabase.from('coin_packages').update({ is_best_seller: false }).neq('id', '00000000-0000-0000-0000-000000000000'); // Reset semua
    await supabase.from('coin_packages').update({ is_best_seller: true }).eq('id', id); // Set yg dipilih
    fetchData();
  };

  // 4. Fungsi Simpan Modal Edit Paket (Koin & Expert)
  const handleSavePackage = async () => {
    try {
      const { id, nama, deskripsi, harga } = editModal.data;
      if (editModal.type === 'coin') {
        const koin = editModal.data.koin;
        await supabase.from('coin_packages').update({ nama, deskripsi, harga, koin }).eq('id', id);
      } else {
        await supabase.from('expert_packages').update({ nama, deskripsi, harga }).eq('id', id);
      }
      setEditModal({ show: false, type: 'coin', data: null });
      fetchData();
      alert("Data paket berhasil diperbarui!");
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-blue-600 animate-pulse">Memuat Pengaturan...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pengaturan Harga & Layanan</h1>
          <p className="text-slate-500 mt-1">Atur harga produk, tarif koin, dan pengaturan diskon secara terpusat.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kurs Saat Ini</p>
          <div className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <span className="text-xl font-black text-slate-800">1 = {formatRp(koinRate)}</span>
            <button onClick={handleUpdateKurs} className="ml-3 text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-100">Ubah Kurs</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BAGIAN KIRI: Koin & AI Tools */}
        <div className="space-y-8">
          
          {/* Tabel AI Tools */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <span className="text-xl">🤖</span>
              <h2 className="font-bold text-slate-800">Tarif Penggunaan AI Tools</h2>
            </div>
            <table className="w-full text-left text-sm text-slate-600">
              <tbody>
                {aiTools.map((tool) => (
                  <tr key={tool.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-700">{tool.nama}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${tool.koin === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                        {tool.koin === 0 ? 'GRATIS' : `${tool.koin} Koin`}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleUpdateAiTarif(tool.id, tool.koin, tool.nama)} className="text-[10px] text-blue-600 font-bold hover:underline">Ubah Tarif</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tabel Paket Koin */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <span className="text-xl">💳</span>
              <h2 className="font-bold text-slate-800">Paket Top Up Koin</h2>
            </div>
            <div className="p-4 space-y-3">
              {coinPkgs.map((pkg) => (
                <div key={pkg.id} className={`p-4 rounded-xl border flex items-center justify-between ${pkg.is_best_seller ? 'border-amber-300 bg-amber-50/30' : 'border-slate-100 bg-slate-50'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800">{pkg.nama}</h4>
                      {pkg.is_best_seller && <span className="bg-amber-400 text-amber-950 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Terlaris</span>}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{pkg.deskripsi}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-black text-amber-500">{pkg.koin} Koin</span>
                      <span className="text-xs font-bold text-slate-400">|</span>
                      <span className="text-xs font-bold text-slate-700">{formatRp(pkg.harga)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setEditModal({ show: true, type: 'coin', data: pkg })} className="text-[10px] bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-50">Edit</button>
                    {!pkg.is_best_seller && (
                      <button onClick={() => handleSetBestSeller(pkg.id)} className="text-[10px] text-amber-600 font-bold hover:underline">Set Terlaris</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* BAGIAN KANAN: Expert Assistance */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <span className="text-xl">🎓</span>
              <h2 className="font-bold text-slate-800">Daftar Paket Expert Assistance</h2>
            </div>
            <div className="p-4 space-y-4">
              {expertPkgs.map((pkg) => (
                <div key={pkg.id} className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-black text-slate-800 text-lg">{pkg.nama}</h4>
                      <p className="text-xs text-slate-500 mt-1">{pkg.deskripsi}</p>
                    </div>
                    <button onClick={() => setEditModal({ show: true, type: 'expert', data: pkg })} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-blue-100">
                      Edit Paket
                    </button>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-4 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harga Jual</span>
                    <span className="text-lg font-black text-emerald-600">{formatRp(pkg.harga)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EDIT DATA (Berlaku untuk Coin & Expert) */}
      {editModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setEditModal({ show: false, type: 'coin', data: null })} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors font-bold">✕</button>
            <h3 className="text-xl font-black text-slate-800 mb-6">Edit {editModal.type === 'coin' ? 'Paket Koin' : 'Paket Expert'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nama Paket</label>
                <input type="text" className="w-full border border-slate-200 p-3 rounded-xl text-sm font-semibold outline-none focus:border-blue-500" value={editModal.data.nama} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, nama: e.target.value } })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Deskripsi Pendek</label>
                <textarea className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500 resize-none h-16" value={editModal.data.deskripsi} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, deskripsi: e.target.value } })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {editModal.type === 'coin' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jumlah Koin</label>
                    <input type="number" className="w-full border border-slate-200 p-3 rounded-xl text-sm font-bold text-amber-600 outline-none focus:border-blue-500" value={editModal.data.koin} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, koin: e.target.value } })} />
                  </div>
                )}
                <div className={editModal.type === 'expert' ? 'col-span-2' : ''}>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Harga (Rp)</label>
                  <input type="number" className="w-full border border-slate-200 p-3 rounded-xl text-sm font-bold text-emerald-600 outline-none focus:border-blue-500" value={editModal.data.harga} onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, harga: e.target.value } })} />
                </div>
              </div>
            </div>

            <button onClick={handleSavePackage} className="w-full py-3.5 mt-8 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all active:scale-95">
              Simpan Perubahan
            </button>
          </div>
        </div>
      )}

    </div>
  );
}