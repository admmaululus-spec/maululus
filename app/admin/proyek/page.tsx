'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function ManajemenProyekPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk Modal Edit Proyek
  const [editModal, setEditModal] = useState<{ show: boolean, data: any }>({ show: false, data: null });

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('premium_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
    } else if (data) {
      setProjects(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenEdit = (project: any) => {
    setEditModal({ show: true, data: { ...project } });
  };

  const handleSaveProject = async () => {
    try {
      const { id, expert, progress, is_active } = editModal.data;
      
      const { error } = await supabase
        .from('premium_projects')
        .update({ expert, progress, is_active })
        .eq('id', id);

      if (error) throw error;
      
      alert("Status proyek berhasil diperbarui!");
      setEditModal({ show: false, data: null });
      fetchProjects(); // Refresh tabel
    } catch (err: any) {
      alert("Gagal menyimpan data: " + err.message);
    }
  };

  const filteredProjects = projects.filter(p => 
    (p.nama_lengkap && p.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.user_email && p.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto p-8 font-sans">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Proyek</h1>
          <p className="text-slate-500 mt-1 text-sm">Pantau pesanan Expert Assistance, perbarui progres, dan tugaskan tim.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          </div>
          <input
            type="text"
            placeholder="Cari nama klien, email, atau ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Data Klien & Order</th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Detail Kampus</th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Status & Progress</th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan={4} className="px-6 py-12 text-center text-blue-600 font-bold animate-pulse">Memuat daftar proyek...</td></tr>
              ) : filteredProjects.length === 0 ? (
                 <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">Belum ada proyek yang masuk.</td></tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-slate-900 mb-1">{project.nama_lengkap || project.user_email}</div>
                      <div className="text-[11px] text-slate-500 mb-2 font-mono">ID: {project.id}</div>
                      <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest mb-2">
                        {project.paket}
                      </span>
                      {project.no_whatsapp && (
                        <a href={`https://wa.me/${project.no_whatsapp}?text=Halo%20${project.nama_lengkap},%20saya%20dari%20Admin%20Maululus.%20Terkait%20pesanan%20Expert%20Assistance%20Anda...`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] font-bold text-green-600 hover:text-green-700 w-fit">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" /></svg>
                          Chat WA Klien
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <p className="text-xs font-bold text-slate-800 mb-1">{project.universitas || '-'}</p>
                      <p className="text-xs text-slate-600 mb-1">{project.jurusan || '-'}</p>
                      <p className="text-[10px] text-slate-400">NIM: {project.nim || '-'}</p>
                      <div className="mt-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Judul Skripsi:</p>
                        <p className="text-xs text-slate-700 font-medium line-clamp-3" title={project.judul}>{project.judul || 'Belum ada judul'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="mb-3">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border ${project.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {project.is_active ? 'Status: Aktif' : 'Status: Selesai'}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expert Bertugas:</p>
                      <p className="text-xs font-semibold text-indigo-600 mb-3">{project.expert || 'Belum di-assign'}</p>
                      
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                        <div className={`h-2 rounded-full transition-all ${project.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${project.progress || 0}%` }}></div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 text-right">{project.progress || 0}%</p>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <button 
                        onClick={() => handleOpenEdit(project)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm active:scale-95"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.89 1.14l-2.827.9a.75.75 0 01-.94-.94l.9-2.827a4.5 4.5 0 011.14-1.89l8.931-8.931z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L22.125 9.75" /></svg>
                        Update Proyek
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Proyek */}
      {editModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setEditModal({ show: false, data: null })} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 rounded-full font-bold transition-colors">✕</button>
            
            <h3 className="text-xl font-black text-slate-800 mb-1">Update Proyek Klien</h3>
            <p className="text-xs text-slate-500 mb-6 font-mono">Order ID: {editModal.data?.id}</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tugaskan Expert / Dosen</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-colors" 
                  placeholder="Nama pembimbing..."
                  value={editModal.data?.expert || ''} 
                  onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, expert: e.target.value } })} 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex justify-between">
                  <span>Progress Pengerjaan</span>
                  <span className="text-blue-600">{editModal.data?.progress || 0}%</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                  value={editModal.data?.progress || 0} 
                  onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, progress: Number(e.target.value) } })} 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status Pesanan</label>
                <select 
                  className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer"
                  value={editModal.data?.is_active ? 'true' : 'false'}
                  onChange={e => setEditModal({ ...editModal, data: { ...editModal.data, is_active: e.target.value === 'true' } })}
                >
                  <option value="true">🟢 Sedang Berjalan (Aktif)</option>
                  <option value="false">🔴 Selesai / Ditutup</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-2">Ubah menjadi Selesai jika dokumen final telah diserahkan dan revisi sudah habis.</p>
              </div>
            </div>

            <button onClick={handleSaveProject} className="w-full py-4 mt-8 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all active:scale-95">
              Simpan Perubahan
            </button>
          </div>
        </div>
      )}

    </div>
  );
}