'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

// Komponen Toggle Kustom (Gaya iOS)
const ToggleSwitch = ({ label, checked, onChange }: any) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
    <span className="text-sm font-bold text-slate-700">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  </div>
);

export default function AdminProyekPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  // State untuk Toggle Smart Pipeline
  const [toggles, setToggles] = useState({ b12: false, b3: false, b45: false, rev: false });

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase.from('premium_projects').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setEditForm(project);
    // Set toggle awal berdasarkan data dari DB
    setToggles({
      b12: project.status_bab12 === 'SELESAI',
      b3: project.status_bab3 === 'SELESAI',
      b45: project.status_bab45 === 'SELESAI',
      rev: project.status_revisi === 'SELESAI'
    });
  };

  const handleSave = async () => {
    // Pipeline Kalkulasi Otomatis (Jika Bab 4 selesai, otomatis bab 1-3 dianggap selesai)
    let progress = 5; // Start (Menunggu/Drafting)
    if (toggles.rev) progress = 100;
    else if (toggles.b45) progress = 80;
    else if (toggles.b3) progress = 50;
    else if (toggles.b12) progress = 25;

    // Set Status Text untuk User Dashboard
    const s_b12 = toggles.b12 ? 'SELESAI' : 'DIPROSES';
    const s_b3 = toggles.b3 ? 'SELESAI' : (toggles.b12 ? 'DIPROSES' : 'MENUNGGU');
    const s_b45 = toggles.b45 ? 'SELESAI' : (toggles.b3 ? 'DIPROSES' : 'MENUNGGU');
    const s_rev = toggles.rev ? 'SELESAI' : (toggles.b45 ? 'DIPROSES' : 'MENUNGGU');

    try {
      const { error } = await supabase.from('premium_projects').update({
        judul: editForm.judul,
        expert: editForm.expert,
        is_active: editForm.is_active,
        progress: progress,
        status_bab12: s_b12,
        status_bab3: s_b3,
        status_bab45: s_b45,
        status_revisi: s_rev,
      }).eq('id', editingId);

      if (error) throw error;
      alert(`Berhasil! Progress Klien terupdate ke ${progress}%`);
      setEditingId(null);
      fetchProjects();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Yakin ingin menghapus proyek ini secara permanen?")) return;
    await supabase.from('premium_projects').delete().eq('id', id);
    fetchProjects();
  };

  if (loading) return <div className="p-10 text-center text-blue-600 font-bold animate-pulse">Memuat Data Klien...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <h1 className="text-3xl font-black mb-2 text-slate-800 tracking-tight">Manajemen Proyek Mahasiswa</h1>
      <p className="text-slate-500 mb-8">Aktifkan proyek, tentukan expert, dan atur progress pengerjaan.</p>
      
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[10px]">
            <tr>
              <th className="p-5 font-bold">Klien & Kampus</th>
              <th className="p-5 font-bold">Judul & Paket</th>
              <th className="p-5 font-bold">Progress</th>
              <th className="p-5 font-bold text-center">Status Pembayaran</th>
              <th className="p-5 font-bold text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="p-5">
                  <p className="font-bold text-slate-800">{p.nama_lengkap || p.user_email}</p>
                  <p className="text-[10px] text-slate-500 mb-1">{p.universitas} - {p.jurusan}</p>
                  <a href={`https://wa.me/${p.no_whatsapp}`} target="_blank" className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold hover:bg-green-200 transition-colors">
                    WA: {p.no_whatsapp}
                  </a>
                </td>
                <td className="p-5 max-w-xs">
                  <p className="font-bold text-slate-700 line-clamp-2 text-xs leading-snug">{p.judul}</p>
                  <p className="text-[10px] font-extrabold text-blue-600 mt-1 uppercase tracking-widest">{p.paket}</p>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full ${p.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{width: `${p.progress}%`}}></div>
                    </div>
                    <span className="font-bold text-slate-700 text-xs">{p.progress}%</span>
                  </div>
                </td>
                <td className="p-5 text-center">
                  {p.is_active 
                    ? <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm">LUNAS / AKTIF</span> 
                    : <span className="bg-rose-50 border border-rose-200 text-rose-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest animate-pulse shadow-sm">MENUNGGU ACC</span>
                  }
                </td>
                <td className="p-5 text-right flex flex-col gap-2 items-end justify-center h-full">
                  <button onClick={() => handleEdit(p)} className="bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-700 transition-colors shadow-sm">⚙️ Kelola Progress</button>
                  <button onClick={() => handleDelete(p.id)} className="text-[10px] text-rose-500 font-bold hover:underline">Hapus Data</button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400 font-medium">Belum ada proyek yang terdaftar.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Popup Pengaturan Klien */}
      {editingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative max-h-[95vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setEditingId(null)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors font-bold">✕</button>
            <h2 className="text-2xl font-black text-slate-800 mb-1">Pengaturan Proyek</h2>
            <p className="text-xs font-bold text-blue-600 mb-6 uppercase tracking-widest">{editForm.nama_lengkap}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Judul Skripsi Klien</label>
                <textarea className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-sm font-semibold text-slate-700 resize-none h-20 outline-none focus:border-blue-500" value={editForm.judul} onChange={e => setEditForm({...editForm, judul: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nama Expert Assign</label>
                  <input type="text" placeholder="Cth: Dr. Budi - Manajemen" className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-sm font-semibold outline-none focus:border-blue-500" value={editForm.expert} onChange={e => setEditForm({...editForm, expert: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Proyek</label>
                  <select className={`w-full border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none ${editForm.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`} value={editForm.is_active ? 'true' : 'false'} onChange={e => setEditForm({...editForm, is_active: e.target.value === 'true'})}>
                    <option value="false">MENUNGGU PEMBAYARAN</option>
                    <option value="true">LUNAS / PROYEK AKTIF</option>
                  </select>
                </div>
              </div>

              {/* Area Toggles Pengerjaan */}
              <div className="pt-6 mt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex justify-between">
                  <span>Kontrol Progress (Toggle)</span>
                  <span className="text-blue-500">Auto Save Status</span>
                </h4>
                
                <div className="space-y-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                  <ToggleSwitch label="1. Bab 1 & Bab 2 Selesai" checked={toggles.b12} onChange={(val: boolean) => setToggles({...toggles, b12: val})} />
                  <ToggleSwitch label="2. Bab 3 Selesai" checked={toggles.b3} onChange={(val: boolean) => setToggles({...toggles, b3: val})} />
                  <ToggleSwitch label="3. Bab 4 & Bab 5 Selesai" checked={toggles.b45} onChange={(val: boolean) => setToggles({...toggles, b45: val})} />
                  <ToggleSwitch label="4. Revisi Akhir & PPT Selesai" checked={toggles.rev} onChange={(val: boolean) => setToggles({...toggles, rev: val})} />
                </div>
              </div>
            </div>

            <button onClick={handleSave} className="w-full py-4 mt-8 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95">
              Simpan & Terapkan Perubahan Klien
            </button>
          </div>
        </div>
      )}
    </div>
  );
}