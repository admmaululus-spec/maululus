'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function CoinPackagesSection() {
  const [pkgs, setPkgs] = useState<any[]>([]);
  const [modal, setModal] = useState({ show: false, mode: 'add', data: { id: '', nama: '', deskripsi: '', harga: '', koin: '' } });

  const fetchPkgs = async () => {
    const { data } = await supabase.from('coin_packages').select('*').order('koin', { ascending: true });
    if (data) setPkgs(data);
  };

  useEffect(() => { fetchPkgs(); }, []);
  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);

  const handleSave = async () => {
    const payload = { nama: modal.data.nama, deskripsi: modal.data.deskripsi, harga: Number(modal.data.harga), koin: Number(modal.data.koin) };
    if (modal.mode === 'add') await supabase.from('coin_packages').insert([payload]);
    else await supabase.from('coin_packages').update(payload).eq('id', modal.data.id);
    setModal({ ...modal, show: false });
    fetchPkgs();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus paket ini?")) {
      await supabase.from('coin_packages').delete().eq('id', id);
      fetchPkgs();
    }
  };

  const handleSetBestSeller = async (id: string) => {
    await supabase.from('coin_packages').update({ is_best_seller: false }).neq('id', id);
    await supabase.from('coin_packages').update({ is_best_seller: true }).eq('id', id);
    fetchPkgs();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="text-xl">💳</span><h2 className="font-bold text-slate-800">Paket Top Up Koin</h2></div>
        <button onClick={() => setModal({ show: true, mode: 'add', data: { id: '', nama: '', deskripsi: '', harga: '', koin: '' } })} className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-bold">+ Tambah</button>
      </div>
      <div className="p-4 space-y-3">
        {pkgs.map((pkg) => (
          <div key={pkg.id} className={`p-4 rounded-xl border flex justify-between ${pkg.is_best_seller ? 'border-amber-300 bg-amber-50/30' : 'border-slate-100'}`}>
            <div>
              <h4 className="font-bold text-slate-800">{pkg.nama} {pkg.is_best_seller && <span className="text-[9px] bg-amber-400 px-2 rounded-full ml-1">Terlaris</span>}</h4>
              <p className="text-[10px] text-slate-500 mt-1">{pkg.deskripsi}</p>
              <div className="mt-2 text-xs font-bold"><span className="text-amber-500">{pkg.koin} Koin</span> | {formatRp(pkg.harga)}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-2">
                <button onClick={() => setModal({ show: true, mode: 'edit', data: pkg })} className="text-[10px] text-blue-600 font-bold">Edit</button>
                <button onClick={() => handleDelete(pkg.id)} className="text-[10px] text-rose-500 font-bold">Hapus</button>
              </div>
              {!pkg.is_best_seller && <button onClick={() => handleSetBestSeller(pkg.id)} className="text-[9px] text-amber-600 mt-2">Set Terlaris</button>}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Reusable */}
      {modal.show && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h3 className="font-black mb-4">{modal.mode === 'add' ? 'Tambah Paket Koin' : 'Edit Paket Koin'}</h3>
            <input className="w-full border p-2 rounded-lg text-sm mb-2" placeholder="Nama Paket" value={modal.data.nama} onChange={e => setModal({...modal, data: {...modal.data, nama: e.target.value}})} />
            <textarea className="w-full border p-2 rounded-lg text-sm mb-2" placeholder="Deskripsi" value={modal.data.deskripsi} onChange={e => setModal({...modal, data: {...modal.data, deskripsi: e.target.value}})} />
            <input type="number" className="w-full border p-2 rounded-lg text-sm mb-2" placeholder="Jumlah Koin" value={modal.data.koin} onChange={e => setModal({...modal, data: {...modal.data, koin: e.target.value}})} />
            <input type="number" className="w-full border p-2 rounded-lg text-sm mb-4" placeholder="Harga (Rp)" value={modal.data.harga} onChange={e => setModal({...modal, data: {...modal.data, harga: e.target.value}})} />
            <div className="flex gap-2">
              <button onClick={() => setModal({...modal, show: false})} className="w-full py-2 bg-slate-100 rounded-lg font-bold">Batal</button>
              <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}