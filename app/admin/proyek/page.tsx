'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function AdminProyekPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Form Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('premium_projects').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setEditForm(project);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('premium_projects').update({
        judul: editForm.judul,
        paket: editForm.paket,
        expert: editForm.expert,
        progress: parseInt(editForm.progress),
        status_bab12: editForm.status_bab12,
        status_bab3: editForm.status_bab3,
        status_bab45: editForm.status_bab45,
        status_revisi: editForm.status_revisi,
        is_active: editForm.is_active
      }).eq('id', editingId);

      if (error) throw error;
      alert("Proyek berhasil diupdate!");
      setEditingId(null);
      fetchProjects();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Data Proyek...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manajemen Proyek Premium</h1>
      
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-800">
            <tr>
              <th className="p-4 border-b">User Email</th>
              <th className="p-4 border-b">Judul & Paket</th>
              <th className="p-4 border-b">Progress</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b hover:bg-slate-50">
                <td className="p-4">{p.user_email}</td>
                <td className="p-4">
                  <p className="font-bold text-slate-800 line-clamp-1">{p.judul}</p>
                  <p className="text-[10px] text-slate-400">{p.paket} - {p.expert}</p>
                </td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">{p.progress}%</span>
                </td>
                <td className="p-4">
                  {p.is_active ? <span className="text-green-600 font-bold text-xs">Aktif</span> : <span className="text-slate-400 font-bold text-xs">Selesai</span>}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleEdit(p)} className="text-blue-600 font-bold hover:underline">Edit Progress</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Edit */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Update Progress Proyek</h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <label className="block font-bold mb-1">Judul Skripsi</label>
                <textarea className="w-full border p-2 rounded" value={editForm.judul} onChange={e => setEditForm({...editForm, judul: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Progress (%)</label>
                  <input type="number" className="w-full border p-2 rounded" value={editForm.progress} onChange={e => setEditForm({...editForm, progress: e.target.value})} />
                </div>
                <div>
                  <label className="block font-bold mb-1">Status Proyek</label>
                  <select className="w-full border p-2 rounded" value={editForm.is_active ? 'true' : 'false'} onChange={e => setEditForm({...editForm, is_active: e.target.value === 'true'})}>
                    <option value="true">Aktif</option>
                    <option value="false">Selesai / Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-bold mb-2 text-slate-800">Status Per Bab</h4>
                {['bab12', 'bab3', 'bab45', 'revisi'].map((bab: string) => (
                  <div key={bab} className="flex justify-between items-center mb-2">
                    <span className="capitalize w-24">{bab}</span>
                    <select 
                      className="border p-1.5 rounded flex-1 text-xs" 
                      value={editForm[`status_${bab}`]} 
                      onChange={e => setEditForm({...editForm, [`status_${bab}`]: e.target.value})}
                    >
                      <option value="MENUNGGU">Menunggu</option>
                      <option value="DIPROSES">Sedang Dikerjakan</option>
                      <option value="SELESAI">Selesai</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingId(null)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded">Batal</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}