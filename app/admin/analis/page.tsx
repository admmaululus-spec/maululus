'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

type Analyst = {
  id: string;
  name: string;
  expertise: string;
  bio: string;
  price: number;
  photo_url: string;
  is_wa_enabled: boolean;
  wa_number: string;
};

export default function AdminAnalis() {
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    expertise: '',
    bio: '',
    price: 0,
    photo_url: '',
    is_wa_enabled: false,
    wa_number: '',
  });

  const fetchAnalysts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('analyst_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnalysts(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAnalysts();
  }, []);

  const handleOpenModal = (analyst: Analyst | null = null) => {
    if (analyst) {
      setEditingId(analyst.id);
      setFormData({
        name: analyst.name,
        expertise: analyst.expertise,
        bio: analyst.bio || '',
        price: analyst.price,
        photo_url: analyst.photo_url || '',
        is_wa_enabled: analyst.is_wa_enabled,
        wa_number: analyst.wa_number || '',
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', expertise: '', bio: '', price: 0, photo_url: '', is_wa_enabled: false, wa_number: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Update
      await supabase.from('analyst_profiles').update(formData).eq('id', editingId);
    } else {
      // Create
      await supabase.from('analyst_profiles').insert([formData]);
    }
    setIsModalOpen(false);
    fetchAnalysts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus analis ini?')) {
      await supabase.from('analyst_profiles').delete().eq('id', id);
      fetchAnalysts();
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin" className="text-sm font-medium text-slate-400 hover:text-blue-600">Dashboard Admin</Link>
            <span className="text-slate-400 text-sm">/</span>
            <span className="text-sm font-medium text-slate-800">Kelola Analis</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Daftar Analis</h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">Kelola profil analis, tarif, dan kontak WhatsApp.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Tambah Analis
        </button>
      </div>

      {/* Tabel Data */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-[1.5rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Profil</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Keahlian</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tarif Chat</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status WA</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analysts.map((analyst) => (
                  <tr key={analyst.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={analyst.photo_url || 'https://via.placeholder.com/40'} alt={analyst.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{analyst.name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[150px]">{analyst.bio}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{analyst.expertise}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">Rp {analyst.price.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${analyst.is_wa_enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {analyst.is_wa_enabled ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(analyst)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm mr-4">Edit</button>
                      <button onClick={() => handleDelete(analyst.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">Hapus</button>
                    </td>
                  </tr>
                ))}
                {analysts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 text-sm font-medium">Belum ada data analis.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Analis' : 'Tambah Analis Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Analis</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" placeholder="Dr. Budi Santoso" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bidang Keahlian</label>
                  <input type="text" required value={formData.expertise} onChange={(e) => setFormData({...formData, expertise: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" placeholder="Metodologi Penelitian, IT" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">URL Foto Profil</label>
                  <input type="url" value={formData.photo_url} onChange={(e) => setFormData({...formData, photo_url: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bio Singkat</label>
                  <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all resize-none" placeholder="Deskripsi pengalaman analis..."></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tarif Chat (Rp)</label>
                  <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" placeholder="50000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nomor WhatsApp</label>
                  <input type="text" value={formData.wa_number} onChange={(e) => setFormData({...formData, wa_number: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all" placeholder="628123456789" />
                </div>
                <div className="md:col-span-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <input type="checkbox" id="wa_toggle" checked={formData.is_wa_enabled} onChange={(e) => setFormData({...formData, is_wa_enabled: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-600" />
                  <label htmlFor="wa_toggle" className="text-sm font-semibold text-slate-700 cursor-pointer">Aktifkan Fitur Chat WhatsApp Langsung (Bypass Sistem Chat Web)</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Batal</button>
                <button type="submit" className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">Simpan Analis</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}