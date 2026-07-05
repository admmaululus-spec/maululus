'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { AcademicCapIcon, UserTieIcon, ChartLineIcon, RefreshIcon, ChatBubbleIcon } from './IconsAndUI';

export default function TabExpert({ riwayatList = [] }: any) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPaket, setSelectedPaket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nama: '', nim: '', univ: '', jurusan: '', no_whatsapp: '', judul: '' });

  const openForm = (namaPaket: string, harga: string) => {
    setSelectedPaket({ nama: namaPaket, harga });
    setShowModal(true);
  };

  const handleOrder = async () => {
    if (!form.nama || !form.no_whatsapp || !form.judul) {
      return alert("Nama, No WhatsApp, dan Judul Skripsi wajib diisi!");
    }
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesi berakhir, silakan login kembali.");

      const { error } = await supabase.from('premium_projects').insert({
        user_id: session.user.id,
        user_email: session.user.email,
        judul: form.judul,
        paket: selectedPaket.nama,
        expert: 'Menunggu Assign Admin',
        nama_lengkap: form.nama,
        nim: form.nim,
        universitas: form.univ,
        jurusan: form.jurusan,
        no_whatsapp: form.no_whatsapp,
        progress: 0,
        is_active: false
      });

      if (error) throw error;

      const textWa = `Halo Admin Maululus, saya ingin memesan *Expert Assistance*.%0A%0A*Paket:* ${selectedPaket.nama}%0A*Nama:* ${form.nama}%0A*Kampus:* ${form.univ}%0A*Judul:* ${form.judul}%0A%0AMohon instruksi pembayarannya.`;
      window.open(`https://wa.me/6281234567890?text=${textWa}`, '_blank');
      
      setShowModal(false);
      alert("Pesanan berhasil dibuat! Silakan selesaikan pembayaran di WhatsApp.");
      window.location.reload(); 

    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-3 mb-2">
        <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><AcademicCapIcon /></span>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Expert Assistance</h2>
          <p className="text-sm text-slate-500">Layanan premium pendampingan penyusunan skripsi 1-on-1.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all group">
           <div>
             <h3 className="text-lg font-bold text-slate-800 mb-2">Paket Proposal</h3>
             <p className="text-xs text-slate-500 mb-6 leading-relaxed">Fokus pengerjaan Bab 1 hingga Bab 3 untuk persiapan Sempro.</p>
             <ul className="space-y-3 mb-8">
               <li className="text-sm text-slate-700 flex items-center gap-2"><span className="text-emerald-500">✔</span> Pembuatan Judul & Bab 1-3</li>
               <li className="text-sm text-slate-700 flex items-center gap-2"><span className="text-emerald-500">✔</span> Revisi Terstruktur</li>
             </ul>
           </div>
           <button onClick={() => openForm('Paket Proposal', 'Rp1.850.000')} className="w-full py-3.5 bg-slate-50 text-emerald-700 font-bold rounded-xl border border-slate-200 hover:bg-emerald-50 transition-colors">
             Pesan Rp1.850.000
           </button>
        </div>

        <div className="bg-[#0B1525] border border-blue-900 rounded-3xl p-8 shadow-xl flex flex-col justify-between transform lg:-translate-y-4">
           <div>
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-lg font-bold text-white">Paket Complete</h3>
               <span className="bg-amber-400 text-amber-950 text-[9px] font-bold px-2 py-1 rounded-md">BEST SELLER</span>
             </div>
             <p className="text-xs text-slate-400 mb-6 leading-relaxed">Pengerjaan lengkap Bab 1 hingga Bab 5 termasuk analisis dan olah data.</p>
             <ul className="space-y-3 mb-8">
               <li className="text-sm text-white flex items-center gap-2"><span className="text-emerald-400">✔</span> Full Bab 1 sampai Bab 5</li>
               <li className="text-sm text-white flex items-center gap-2"><span className="text-emerald-400">✔</span> Olah Data & PPT Sidang</li>
             </ul>
           </div>
           <button onClick={() => openForm('Paket Complete', 'Rp6.200.000')} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-500 transition-colors">
             Pilih Paket Rp6.200.000
           </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all group">
           <div>
             <h3 className="text-lg font-bold text-slate-800 mb-2">Paket Semhas</h3>
             <p className="text-xs text-slate-500 mb-6 leading-relaxed">Melanjutkan pengerjaan Bab 4 dan 5 setelah sidang proposal.</p>
             <ul className="space-y-3 mb-8">
               <li className="text-sm text-slate-700 flex items-center gap-2"><span className="text-emerald-500">✔</span> Olah Data Penelitian</li>
               <li className="text-sm text-slate-700 flex items-center gap-2"><span className="text-emerald-500">✔</span> Bab 4 - 5 & Pendampingan Sidang</li>
             </ul>
           </div>
           <button onClick={() => openForm('Paket Semhas', 'Rp4.200.000')} className="w-full py-3.5 bg-slate-50 text-emerald-700 font-bold rounded-xl border border-slate-200 hover:bg-emerald-50 transition-colors">
             Pesan Rp4.200.000
           </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8">
        <h3 className="font-bold text-slate-800 mb-6 text-center">Kenapa Memilih Expert Assistance?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <div className="text-center">
             <div className="w-12 h-12 mx-auto bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3"><UserTieIcon /></div>
             <h4 className="text-xs font-bold text-slate-800 mb-1">Dosen & Praktisi</h4>
             <p className="text-[10px] text-slate-500">Dikerjakan oleh expert di bidang studimu.</p>
           </div>
           <div className="text-center">
             <div className="w-12 h-12 mx-auto bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3"><ChartLineIcon /></div>
             <h4 className="text-xs font-bold text-slate-800 mb-1">Progress Transparan</h4>
             <p className="text-[10px] text-slate-500">Pantau progres pengerjaan di dashboardmu.</p>
           </div>
           <div className="text-center">
             <div className="w-12 h-12 mx-auto bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3"><RefreshIcon /></div>
             <h4 className="text-xs font-bold text-slate-800 mb-1">Garansi Revisi</h4>
             <p className="text-[10px] text-slate-500">Sesuai arahan dan masukan dari dosen pembimbing.</p>
           </div>
           <div className="text-center">
             <div className="w-12 h-12 mx-auto bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3"><ChatBubbleIcon /></div>
             <h4 className="text-xs font-bold text-slate-800 mb-1">Diskusi Fleksibel</h4>
             <p className="text-[10px] text-slate-500">Komunikasi terarah lewat admin pendamping.</p>
           </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors font-bold">✕</button>
            <h3 className="text-xl font-black text-slate-800 mb-1">Form Pemesanan Expert</h3>
            <p className="text-xs text-slate-500 mb-6">Paket: <span className="font-bold text-blue-600">{selectedPaket?.nama}</span></p>

            <div className="space-y-4">
               <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                 <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none mt-1" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} placeholder="Sesuai KTP/KTM" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No. WhatsApp</label>
                   <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none mt-1" value={form.no_whatsapp} onChange={e => setForm({...form, no_whatsapp: e.target.value})} placeholder="0812..." />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NIM</label>
                   <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none mt-1" value={form.nim} onChange={e => setForm({...form, nim: e.target.value})} />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Universitas</label>
                   <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none mt-1" value={form.univ} onChange={e => setForm({...form, univ: e.target.value})} />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fakultas/Jurusan</label>
                   <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none mt-1" value={form.jurusan} onChange={e => setForm({...form, jurusan: e.target.value})} />
                 </div>
               </div>
               <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Judul Skripsi (Opsional, pilih dari AI)</label>
                 <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none mt-1 mb-2" onChange={e => setForm({...form, judul: e.target.value})}>
                   <option value="">-- Ketik manual di bawah atau pilih dari riwayat --</option>
                   {riwayatList.filter((r:any) => !r.tool_name).map((r:any) => (
                      <option key={r.id} value={r.judul}>{r.judul}</option>
                   ))}
                 </select>
                 <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none resize-none h-20" placeholder="Ketik judul skripsimu di sini..." value={form.judul} onChange={e => setForm({...form, judul: e.target.value})}></textarea>
               </div>
               <button onClick={handleOrder} disabled={loading} className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl mt-2 hover:bg-emerald-500 transition-all flex justify-center items-center gap-2 shadow-lg">
                 {loading ? 'Memproses...' : '💬 Kirim Form & Pesan via WhatsApp'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}