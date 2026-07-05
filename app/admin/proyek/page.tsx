'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

// Komponen Smart Toggle Switch kustom gaya iOS
const ToggleSwitch = ({ label, checked, onChange }: any) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
    <span className="text-sm font-bold text-slate-700">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
    </label>
  </div>
);

export default function AdminProyekPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  // State khusus untuk Smart Toggles Pipeline
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
    // Inisialisasi Toggles dari DB
    setToggles({
      b12: project.status_bab12 === 'SELESAI',
      b3: project.status_bab3 === 'SELESAI',
      b45: project.status_bab45 === 'SELESAI',
      rev: project.status_revisi === 'SELESAI'
    });
  };

  const handleSave = async () => {
    // Pipeline Progress Pintar: Menentukan persentase berdasarkan posisi toggle terjauh
    let progress = 5; // Awal pengerjaan
    if (toggles.rev) progress = 100;
    else if (toggles.b45) progress = 80;
    else if (toggles.b3) progress = 50;
    else if (toggles.b12) progress = 25;

    // Logika Status Berantai
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
      alert(`Progress diupdate otomatis menjadi ${progress}%`);
      setEditingId(null);
      fetchProjects();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Data Proyek...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-extrabold mb-8 text-slate-800 tracking-tight">Manajemen Proyek Mahasiswa</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[10px]">
            <tr>
              <th className="p-5 font-bold">Identitas Klien</th>
              <th className="p-5 font-bold">Judul & Detail</th>
              <th className="p-5 font-bold">Progress</th>
              <th className="p-5 font-bold">Status</th>
              <th className="p-5 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="p-5">
                  <p className="font-bold text-slate-800">{p.nama_lengkap || 'Belum Diisi'}</p>
                  <p className="text-[10px] text-slate-500">{p.universitas} - {p.jurusan}</p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">WA: {p.no_whatsapp}</p>
                </td>
                <td className="p-5 max-w-xs">
                  <p className="font-bold text-blue-700 line-clamp-2 leading-snug cursor-pointer" title={p.judul}>{p.judul}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{p.paket}</p>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: `${p.progress}%`}}></div>
                    </div>
                    <span className="font-bold text-slate-700 text-xs">{p.progress}%</span>
                  </div>
                </td>
                <td className="p-5">
                  {p.is_active 
                    ? <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">AKTIF</span> 
                    : <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">PENDING/SELESAI</span>
                  }
                </td>
                <td className="p-5 text-right">
                  <button onClick={() => handleEdit(p)} className="bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-xl text-xs hover:bg-blue-100 transition-colors">Kelola Proyek</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Kelola Smart Toggles */}
      {editingId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setEditingId(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors font-bold">✕</button>
            <h2 className="text-xl font-black text-slate-800 mb-6">Update Progress Proyek</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Judul Skripsi Klien</label>
                <textarea className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-sm font-semibold text-slate-700 resize-none h-16 outline-none focus:border-blue-500" value={editForm.judul} onChange={e => setEditForm({...editForm, judul: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nama Expert Assign</label>
                  <input type="text" className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-blue-500" value={editForm.expert} onChange={e => setEditForm({...editForm, expert: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Lisensi</label>
                  <select className="w-full border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none" value={editForm.is_active ? 'true' : 'false'} onChange={e => setEditForm({...editForm, is_active: e.target.value === 'true'})}>
                    <option value="false">MENUNGGU ACC</option>
                    <option value="true">PROYEK AKTIF</option>
                  </select>
                </div>
              </div>

              {/* Area Smart Toggles Pipeline */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tandai Bab Yang Selesai</h4>
                
                <ToggleSwitch label="Bab 1 & Bab 2 Selesai" checked={toggles.b12} onChange={(val: boolean) => setToggles({...toggles, b12: val})} />
                <ToggleSwitch label="Bab 3 Selesai" checked={toggles.b3} onChange={(val: boolean) => setToggles({...toggles, b3: val})} />
                <ToggleSwitch label="Bab 4 & Bab 5 Selesai" checked={toggles.b45} onChange={(val: boolean) => setToggles({...toggles, b45: val})} />
                <ToggleSwitch label="Revisi Akhir / PPT Selesai" checked={toggles.rev} onChange={(val: boolean) => setToggles({...toggles, rev: val})} />
                
                <p className="text-[9px] text-slate-500 italic mt-2 text-center">Sistem akan otomatis menghitung loading bar progress dan merubah status urutan berikutnya menjadi 'Sedang Dikerjakan'.</p>
              </div>
            </div>

            <button onClick={handleSave} className="w-full py-4 mt-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
              Simpan & Terapkan Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
}