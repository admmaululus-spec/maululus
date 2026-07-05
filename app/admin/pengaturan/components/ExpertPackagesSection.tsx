'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function ExpertPackagesSection() {
  const [pkgs, setPkgs] = useState<any[]>([]);
  const [modal, setModal] = useState({ show: false, mode: 'add', data: { id: '', nama: '', deskripsi: '', harga: '' } });

  const fetchPkgs = async () => {
    const { data } = await supabase.from('expert_packages').select('*').order('harga', { ascending: true });
    if (data) setPkgs(data);
  };

  useEffect(() => { fetchPkgs(); }, []);
  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);

  const handleSave = async () => {
    const payload = { nama: modal.data.nama, deskripsi: modal.data.deskripsi, harga: Number(modal.data.harga) };
    if (modal.mode === 'add') await supabase.from('expert_packages').insert([payload]);
    else await supabase.from('expert_packages').update(payload).eq('id', modal.data.id);
    setModal({ ...modal, show: false });
    fetchPkgs();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus paket expert ini?")) {
      await supabase.from('expert_packages').delete().eq('id', id);
      fetchPkgs();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="text-xl">🎓</span><h2 className="font-bold text-slate-800">Paket Expert Assistance</h2></div>
        <button onClick={() => setModal({ show: true, mode: 'add', data: { id: '', nama: '', deskripsi: '', harga: '' } })} className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-bold">+ Tambah</button>
      </div>
      <div className="p-4 space-y-4">
        {pkgs.map((pkg) => (
          <div key={pkg.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-300">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-black text-slate-800">{pkg.nama}</h4>
                <p className="text-xs text-slate-500 mt-1">{pkg.deskripsi}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setModal({ show: true, mode: 'edit', data: pkg })} className="text-[10px] bg-slate-100 px-2 py-1 rounded-md font-bold">Edit</button>
                <button onClick={() => handleDelete(pkg.id)} className="text-[10px] bg-rose-50 text-rose-500 px-2 py-1 rounded-md font-bold">Hapus</button>
              </div>
            </div>
            <div className="mt-3 text-sm font-black text-emerald-600">{formatRp(pkg.harga)}</div>
          </div>
        ))}
      </div>

      {modal.show && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h3 className="font-black mb-4">{modal.mode === 'add' ? 'Tambah Paket Expert' : 'Edit Paket Expert'}</h3>
            <input className="w-full border p-2 rounded-lg text-sm mb-2" placeholder="Nama Paket" value={modal.data.nama} onChange={e => setModal({...modal, data: {...modal.data, nama: e.target.value}})} />
            <textarea className="w-full border p-2 rounded-lg text-sm mb-2 h-20" placeholder="Deskripsi Lengkap" value={modal.data.deskripsi} onChange={e => setModal({...modal, data: {...modal.data, deskripsi: e.target.value}})} />
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