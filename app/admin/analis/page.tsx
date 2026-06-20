'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';

type Analyst = {
  id: string;
  user_id: string;
  name: string;
  expertise: string;
  bio: string;
  price: number;
  photo_url: string;
  is_wa_enabled: boolean;
  wa_number: string;
  email?: string; // Virtual property untuk kemudahan UI
};

export default function AdminAnalis() {
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    email: '', // TAMBAHAN BARU UNTUK LOGIN
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
    const { data, error } = await supabase.from('analyst_profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) setAnalysts(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchAnalysts(); }, []);

  const handleOpenModal = (analyst: Analyst | null = null) => {
    if (analyst) {
      setEditingId(analyst.id);
      setFormData({
        email: 'Tidak bisa ubah email saat edit', // Sengaja dikunci saat edit
        name: analyst.name, expertise: analyst.expertise, bio: analyst.bio || '',
        price: analyst.price, photo_url: analyst.photo_url || '',
        is_wa_enabled: analyst.is_wa_enabled, wa_number: analyst.wa_number || '',
      });
    } else {
      setEditingId(null);
      setFormData({ email: '', name: '', expertise: '', bio: '', price: 0, photo_url: '', is_wa_enabled: false, wa_number: '' });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const scaleSize = 500 / img.width;
        canvas.width = 500;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const compressedFile = new File([blob], `avatar_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const { data, error } = await supabase.storage.from('analyst_photos').upload(compressedFile.name, compressedFile);
          
          if (!error) {
            const { data: publicUrlData } = supabase.storage.from('analyst_photos').getPublicUrl(compressedFile.name);
            setFormData(prev => ({ ...prev, photo_url: publicUrlData.publicUrl }));
          } else {
            alert('Gagal upload gambar! Pastikan RLS Storage sudah dibuka.');
          }
          setIsUploading(false);
        }, 'image/jpeg', 0.7);
      };
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true); // Manfaatkan state ini untuk loading button

    if (editingId) {
      // PROSES EDIT
      await supabase.from('analyst_profiles').update({
        name: formData.name, expertise: formData.expertise, bio: formData.bio,
        price: formData.price, photo_url: formData.photo_url,
        is_wa_enabled: formData.is_wa_enabled, wa_number: formData.wa_number
      }).eq('id', editingId);
    } else {
      // PROSES TAMBAH BARU (LOGIKA LOGIN)
      // 1. Cari user di tabel profiles berdasarkan email yang diketik Admin
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', formData.email)
        .single();

      if (profileError || !userProfile) {
        alert('Gagal! Email tersebut belum terdaftar. Minta analis untuk mendaftar akun biasa (Sign Up) di Maululus terlebih dahulu, lalu masukkan emailnya ke sini.');
        setIsUploading(false);
        return;
      }

      // 2. Ubah role user tersebut menjadi 'analyst' di database
      await supabase.from('profiles').update({ role: 'analyst' }).eq('id', userProfile.id);

      // 3. Masukkan datanya ke tabel analyst_profiles dan hubungkan dengan user_id
      await supabase.from('analyst_profiles').insert([{
        user_id: userProfile.id, // Kunci utama agar bisa login ke dashboard analis!
        name: formData.name,
        expertise: formData.expertise,
        bio: formData.bio,
        price: formData.price,
        photo_url: formData.photo_url,
        is_wa_enabled: formData.is_wa_enabled,
        wa_number: formData.wa_number
      }]);
    }
    
    setIsModalOpen(false);
    setIsUploading(false);
    fetchAnalysts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus analis ini? Jika dihapus, akunnya akan kembali menjadi user biasa.')) {
      // Kembalikan role ke user biasa (opsional tapi disarankan)
      const targetAnalyst = analysts.find(a => a.id === id);
      if(targetAnalyst?.user_id) {
        await supabase.from('profiles').update({ role: 'user' }).eq('id', targetAnalyst.user_id);
      }
      await supabase.from('analyst_profiles').delete().eq('id', id);
      fetchAnalysts();
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Daftar Analis</h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">Kelola profil analis, tarif, dan kontak WhatsApp.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">
          + Tambah Analis
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-t-blue-600"></div></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Profil</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Keahlian</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tarif Chat</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status WA</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analysts.map((analyst) => (
                <tr key={analyst.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={analyst.photo_url || 'https://via.placeholder.com/40'} alt="P" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{analyst.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[150px]">Analis Pro</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{analyst.expertise}</td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600">{analyst.price} Koin</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${analyst.is_wa_enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {analyst.is_wa_enabled ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenModal(analyst)} className="text-blue-600 font-semibold text-sm mr-4">Edit</button>
                    <button onClick={() => handleDelete(analyst.id)} className="text-red-500 font-semibold text-sm">Hapus</button>
                  </td>
                </tr>
              ))}
              {analysts.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-slate-500 font-medium">Belum ada analis.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Analis' : 'Tambah Analis Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full font-bold text-xl transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* INPUT EMAIL HANYA MUNCUL SAAT TAMBAH BARU */}
                {!editingId && (
                  <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Email Akun Analis (Wajib)</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full text-slate-900 border border-blue-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Masukkan email analis yang sudah register..." />
                    <p className="text-[10px] text-blue-600 mt-2 font-semibold">*Pastikan analis sudah membuat akun di Maululus. Sistem akan memberikan hak akses login secara otomatis.</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Analis</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Jono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Bidang Keahlian</label>
                  <input type="text" required value={formData.expertise} onChange={(e) => setFormData({...formData, expertise: e.target.value})} className="w-full text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cth: Suprapto" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Foto Profil</label>
                  <div className="flex items-center gap-4">
                    {formData.photo_url && <img src={formData.photo_url} alt="Preview" className="h-16 w-16 rounded-full object-cover border border-slate-200" />}
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">
                      {isUploading ? 'Mengompres...' : 'Pilih Foto (Auto Compress)'}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Spesialisasi / Pengalaman (Bio)</label>
                  <textarea rows={2} required value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Sistem Informasi & Software Engineering"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tarif Chat (Koin)</label>
                  <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: 5" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nomor WhatsApp</label>
                  <input type="text" value={formData.wa_number} onChange={(e) => setFormData({...formData, wa_number: e.target.value})} className="w-full text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="6281234..." />
                </div>
                <div className="md:col-span-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                  <input type="checkbox" id="wa_toggle" checked={formData.is_wa_enabled} onChange={(e) => setFormData({...formData, is_wa_enabled: e.target.checked})} className="w-5 h-5 text-blue-600 rounded border-slate-300" />
                  <label htmlFor="wa_toggle" className="text-sm font-semibold text-slate-700 cursor-pointer">Aktifkan Tombol Hubungi WhatsApp (Bypass Sistem Koin)</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Batal</button>
                <button type="submit" disabled={isUploading} className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                  {isUploading ? 'Menyimpan...' : 'Simpan Analis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}