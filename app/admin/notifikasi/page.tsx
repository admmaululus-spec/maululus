// app/admin/notifikasi/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function AdminNotifikasiPage() {
  const [activeTab, setActiveMenu] = useState('broadcast');
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formBroadcast, setFormBroadcast] = useState({ title: '', message: '', icon: '🔔', isGlobal: true, userId: '' });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const { data } = await supabase.from('notification_rules').select('*').order('created_at', { ascending: false });
    if (data) setRules(data);
  };

  const handleKirimBroadcast = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formBroadcast.title,
        message: formBroadcast.message,
        icon: formBroadcast.icon,
        user_id: formBroadcast.isGlobal ? null : formBroadcast.userId || null
      };
      await supabase.from('notifications').insert(payload);
      alert("Notifikasi berhasil dikirim!");
      setFormBroadcast({ ...formBroadcast, title: '', message: '' });
    } catch (err) {
      alert("Gagal mengirim notifikasi");
    }
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto p-8 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pusat Notifikasi</h1>
        <p className="text-slate-500 mt-1 text-sm">Kirim pesan ke user atau atur otomatisasi peringatan sistem.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveMenu('broadcast')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'broadcast' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Kirim Manual</button>
        <button onClick={() => setActiveMenu('rules')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'rules' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Otomatisasi (Rules)</button>
      </div>

      {activeTab === 'broadcast' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-2xl">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Kirim Pesan Baru</h3>
          <form onSubmit={handleKirimBroadcast} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Penerima</label>
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" onChange={(e) => setFormBroadcast({...formBroadcast, isGlobal: e.target.value === 'all'})}>
                <option value="all">Semua Pengguna (Broadcast)</option>
                <option value="specific">Spesifik User (Berdasarkan ID)</option>
              </select>
            </div>
            {!formBroadcast.isGlobal && (
               <input type="text" placeholder="Masukkan ID User (UUID)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" onChange={(e) => setFormBroadcast({...formBroadcast, userId: e.target.value})} required/>
            )}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ikon</label>
                <input type="text" value={formBroadcast.icon} onChange={(e) => setFormBroadcast({...formBroadcast, icon: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-center text-xl" />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Pesan</label>
                <input type="text" value={formBroadcast.title} onChange={(e) => setFormBroadcast({...formBroadcast, title: e.target.value})} placeholder="Contoh: Promo Flash Sale!" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" required/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Isi Pesan</label>
              <textarea value={formBroadcast.message} onChange={(e) => setFormBroadcast({...formBroadcast, message: e.target.value})} placeholder="Tulis deskripsi notifikasi..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none h-32 resize-none" required></textarea>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors">{loading ? 'Mengirim...' : 'Kirim Sekarang 🚀'}</button>
          </form>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-800">Aturan Otomatis (Rule Engine)</h3>
             <button className="bg-emerald-50 text-emerald-600 font-bold px-4 py-2 rounded-xl text-sm">+ Tambah Rule Baru (Segera)</button>
          </div>
          <table className="w-full text-left text-sm text-slate-600">
             <thead className="bg-slate-50 border-b border-slate-200">
               <tr>
                 <th className="p-4 font-bold text-xs uppercase">Nama Aturan</th>
                 <th className="p-4 font-bold text-xs uppercase">Pemicu (Trigger)</th>
                 <th className="p-4 font-bold text-xs uppercase">Cooldown</th>
                 <th className="p-4 font-bold text-xs uppercase text-right">Status</th>
               </tr>
             </thead>
             <tbody>
               {rules.map((rule) => (
                 <tr key={rule.id} className="border-b border-slate-100">
                   <td className="p-4 font-bold text-slate-800">{rule.nama_rule}</td>
                   <td className="p-4"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase">{rule.kondisi} &lt;= {rule.nilai_kondisi}</span></td>
                   <td className="p-4 font-medium text-slate-500">Maks 1x / {rule.cooldown_hari} Hari</td>
                   <td className="p-4 text-right">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${rule.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{rule.is_active ? 'AKTIF' : 'MATI'}</span>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      )}
    </div>
  );
}