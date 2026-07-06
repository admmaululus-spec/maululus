'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function AiToolsSection() {
  const [tools, setTools] = useState<any[]>([]);
  // Mode 'add' dihapus, modal khusus untuk edit
  const [modal, setModal] = useState({ show: false, data: { id: '', nama: '', koin: '' } });

  const fetchTools = async () => {
    const { data, error } = await supabase.from('ai_tools_pricing').select('*').order('koin', { ascending: true });
    if (data) setTools(data);
    if (error) console.error("Error fetching AI tools:", error);
  };

  useEffect(() => { fetchTools(); }, []);

  const handleSave = async () => {
    const payload = { nama: modal.data.nama, koin: Number(modal.data.koin) };
    
    // Hanya melakukan update, fungsi insert dihapus
    await supabase.from('ai_tools_pricing').update(payload).eq('id', modal.data.id);
    
    setModal({ show: false, data: { id: '', nama: '', koin: '' } });
    fetchTools();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🤖</span>
          <h2 className="font-bold text-slate-800">Tarif Penggunaan AI Tools</h2>
        </div>
        {/* Tombol + Tambah Tool sudah dihapus sesuai instruksi */}
      </div>
      
      <table className="w-full text-left text-sm text-slate-600">
        <tbody>
          {tools.map((tool) => (
            <tr key={tool.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
              <td className="p-4 font-semibold text-slate-700">{tool.nama}</td>
              <td className="p-4">
                <span className="px-3 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
                  {tool.koin} Koin
                </span>
              </td>
              <td className="p-4 text-right flex justify-end gap-2">
                {/* Tombol Edit diperbaiki UI-nya agar jelas terlihat */}
                <button 
                  onClick={() => setModal({ show: true, data: tool })} 
                  className="px-3 py-1.5 text-[11px] bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
          {tools.length === 0 && (
            <tr>
              <td colSpan={3} className="p-6 text-center text-slate-400">Belum ada data tool AI</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Edit */}
      {modal.show && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-slate-100">
            <h3 className="font-black text-slate-800 text-lg mb-5">Edit Tarif AI Tool</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Tool</label>
                <input 
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" 
                  placeholder="Nama Tool" 
                  value={modal.data.nama} 
                  onChange={e => setModal({...modal, data: {...modal.data, nama: e.target.value}})} 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tarif (Koin)</label>
                <input 
                  type="number" 
                  className="w-full border border-slate-300 p-2.5 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" 
                  placeholder="Tarif Koin" 
                  value={modal.data.koin} 
                  onChange={e => setModal({...modal, data: {...modal.data, koin: e.target.value}})} 
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setModal({ show: false, data: { id: '', nama: '', koin: '' } })} 
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl font-bold text-slate-600"
              >
                Batal
              </button>
              <button 
                onClick={handleSave} 
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-xl font-bold shadow-md shadow-blue-600/20"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}