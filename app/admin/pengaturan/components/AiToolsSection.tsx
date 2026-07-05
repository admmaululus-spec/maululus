'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function AiToolsSection() {
  const [tools, setTools] = useState<any[]>([]);
  const [modal, setModal] = useState({ show: false, mode: 'add', data: { id: '', nama: '', koin: '' } });

  const fetchTools = async () => {
    const { data } = await supabase.from('ai_tools_pricing').select('*').order('koin', { ascending: true });
    if (data) setTools(data);
  };

  useEffect(() => { fetchTools(); }, []);

  const handleSave = async () => {
    const payload = { nama: modal.data.nama, koin: Number(modal.data.koin) };
    if (modal.mode === 'add') {
      await supabase.from('ai_tools_pricing').insert([payload]);
    } else {
      await supabase.from('ai_tools_pricing').update(payload).eq('id', modal.data.id);
    }
    setModal({ show: false, mode: 'add', data: { id: '', nama: '', koin: '' } });
    fetchTools();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus AI Tool ini?")) {
      await supabase.from('ai_tools_pricing').delete().eq('id', id);
      fetchTools();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3"><span className="text-xl">🤖</span><h2 className="font-bold text-slate-800">Tarif Penggunaan AI Tools</h2></div>
        <button onClick={() => setModal({ show: true, mode: 'add', data: { id: '', nama: '', koin: '' } })} className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-100">+ Tambah Tool</button>
      </div>
      
      <table className="w-full text-left text-sm text-slate-600">
        <tbody>
          {tools.map((tool) => (
            <tr key={tool.id} className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="p-4 font-semibold text-slate-700">{tool.nama}</td>
              <td className="p-4"><span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700">{tool.koin} Koin</span></td>
              <td className="p-4 text-right flex justify-end gap-2">
                <button onClick={() => setModal({ show: true, mode: 'edit', data: tool })} className="text-[10px] text-blue-600 font-bold">Edit</button>
                <button onClick={() => handleDelete(tool.id)} className="text-[10px] text-rose-500 font-bold">Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal.show && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <h3 className="font-black mb-4">{modal.mode === 'add' ? 'Tambah Tool AI' : 'Edit Tool AI'}</h3>
            <input className="w-full border p-2 rounded-lg text-sm mb-3" placeholder="Nama Tool" value={modal.data.nama} onChange={e => setModal({...modal, data: {...modal.data, nama: e.target.value}})} />
            <input type="number" className="w-full border p-2 rounded-lg text-sm mb-5" placeholder="Tarif Koin" value={modal.data.koin} onChange={e => setModal({...modal, data: {...modal.data, koin: e.target.value}})} />
            <div className="flex gap-2">
              <button onClick={() => setModal({...modal, show: false})} className="w-full py-2 bg-slate-100 rounded-lg font-bold text-slate-600">Batal</button>
              <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}