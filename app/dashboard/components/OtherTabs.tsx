'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { 
  SparklesIcon, ToolItem, TargetIcon, PencilIcon, RefreshIcon, SummarizeIcon, MagnifyIcon, CitationIcon, ShieldCheckIcon, DocumentIcon, BookOpenIcon, AcademicCapIcon, UserTieIcon, ChartLineIcon, ChatBubbleIcon 
} from './IconsAndUI';

// ================= 1. TAB AI TOOLS =================
export function TabAiTools({ koin }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
        <div className="mb-8 border-b border-slate-100 pb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
              <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><SparklesIcon /></span>
              Direktori AI Tools
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl">Sistem akan otomatis memotong saldo koin per penggunaan.</p>
          </div>
          <div className="hidden md:flex bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl items-center gap-2">
            <span className="text-amber-500 text-lg">🪙</span>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Saldo Tersedia</p>
              <p className="text-sm font-black text-slate-800">{koin} Koin</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ToolItem href="/generator" icon={<TargetIcon />} label="Buat Judul" isFree />
          <ToolItem href="/dashboard/copilot" icon={<PencilIcon />} label="AI Draft Writer" coin={15} isHot />
          <ToolItem href="/dashboard/parafrase" icon={<RefreshIcon />} label="Parafrase" coin={15} />
          <ToolItem href="/dashboard/ringkasan-jurnal" icon={<SummarizeIcon />} label="Ringkasan Jurnal" coin={3} />
          <ToolItem href="/dashboard/cari-jurnal" icon={<MagnifyIcon />} label="Cari Jurnal" coin={5} />
          <ToolItem href="/dashboard/sitasi" icon={<CitationIcon />} label="Generate Sitasi" coin={2} />
          <ToolItem href="/dashboard/turnitin" icon={<ShieldCheckIcon />} label="Turnitin Check" coin={20} />
        </div>
      </div>
    </div>
  );
}

// ================= 2. TAB DOKUMEN =================
export function TabDokumen({ dokumenList, router, handleBukaKunci, isProcessing }: any) {
  return (
    <div className="animate-in fade-in max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><DocumentIcon /></span>
        <h2 className="text-2xl font-extrabold text-slate-800">Dokumen Skripsi AI</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {dokumenList.length > 0 ? dokumenList.map((item: any) => (
          <div key={item.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-blue-300 transition-colors flex flex-col justify-between">
             <div>
               <div className="flex items-center justify-between mb-3">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                 <span className={`text-[9px] font-bold px-2 py-1 rounded ${item.is_unlocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{item.is_unlocked ? 'TERBUKA' : 'TERKUNCI'}</span>
               </div>
               <h3 className="font-bold text-slate-800 text-sm leading-snug mb-4">{item.judul}</h3>
             </div>
             {item.is_unlocked ? (
               <button onClick={() => router.push(`/dashboard/dokumen?id=${item.id}`)} className="w-full bg-blue-50 text-blue-600 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">Buka Dokumen</button>
             ) : (
               <button onClick={() => handleBukaKunci(item.id)} disabled={isProcessing === item.id} className="w-full bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors">Buka Kunci (-1 Koin)</button>
             )}
          </div>
        )) : (
          <div className="col-span-full py-16 bg-white border border-slate-200 border-dashed rounded-3xl text-center">
            <p className="text-slate-500 text-sm mb-4">Anda belum memiliki dokumen hasil AI.</p>
            <Link href="/generator" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700">Buat Skripsi Baru</Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ================= 3. TAB JURNAL =================
export function TabJurnal({ jurnalRefList, router, setActiveMenu }: any) {
  return (
    <div className="animate-in fade-in max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><BookOpenIcon /></span>
        <h2 className="text-2xl font-extrabold text-slate-800">Jurnal & Referensi AI</h2>
      </div>
      <div className="space-y-4">
        {jurnalRefList.length > 0 ? jurnalRefList.map((item: any) => (
          <div key={item.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-blue-300 transition-colors">
             <div className="flex items-start justify-between">
               <div>
                 <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded mb-2">{item.tool_name}</span>
                 <p className="text-sm font-bold text-slate-800 mb-1">{item.input_data ? item.input_data.substring(0, 80) + '...' : 'Data Referensi'}</p>
                 <p className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleString('id-ID')}</p>
               </div>
               <button onClick={() => router.push(`/dashboard/${item.tool_name.toLowerCase().replace(' ', '-')}`)} className="text-xs bg-white border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl hover:bg-slate-50">Buka Tool</button>
             </div>
          </div>
        )) : (
          <div className="py-16 bg-white border border-slate-200 border-dashed rounded-3xl text-center">
            <p className="text-slate-500 text-sm mb-4">Riwayat pencarian jurnal Anda masih kosong.</p>
            <button onClick={() => setActiveMenu('ai-tools')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700">Buka AI Tools</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ================= 4. TAB PENGATURAN =================
export function TabPengaturan({ userName, userEmail, userWhatsapp }: any) {
  return (
    <div className="animate-in fade-in max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <div className="h-16 w-16 bg-[#0D1C2E] rounded-full flex items-center justify-center text-white text-2xl font-black">{userName.charAt(0)}</div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{userName}</h2>
            <p className="text-sm text-slate-500 font-medium">Mahasiswa Akhir</p>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
            <div className="flex items-center justify-between bg-slate-50 px-5 py-4 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-800 text-sm">{userEmail}</span>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">Terverifikasi</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">WhatsApp</label>
            <div className="flex items-center bg-slate-50 px-5 py-4 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-800 text-sm">{userWhatsapp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= 5. TAB EXPERT ASSISTANCE DENGAN FORM ORDER =================
export function TabExpert({ riwayatList = [] }: any) {
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
        is_active: false // Status false sampai admin meng-ACC pembayarannya
      });

      if (error) throw error;

      // Alihkan ke WhatsApp Admin
      const textWa = `Halo Admin Maululus, saya ingin memesan *Expert Assistance*.%0A%0A*Paket:* ${selectedPaket.nama}%0A*Nama:* ${form.nama}%0A*Kampus:* ${form.univ}%0A*Judul:* ${form.judul}%0A%0AMohon instruksi pembayarannya.`;
      window.open(`https://wa.me/6281234567890?text=${textWa}`, '_blank'); // Ganti dengan nomor WA aslimu
      
      setShowModal(false);
      alert("Pesanan berhasil dibuat! Silakan selesaikan pembayaran di WhatsApp.");
      window.location.reload(); // Refresh untuk update status

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
        {/* Paket Proposal */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all group">
           <div>
             <h3 className="text-lg font-bold text-slate-800 mb-2">Paket Proposal</h3>
             <p className="text-xs text-slate-500 mb-6 leading-relaxed">Fokus pengerjaan Bab 1 hingga Bab 3 untuk persiapan Sempro.</p>
             <ul className="space-y-3 mb-8">
               <li className="text-sm text-slate-700 flex items-center gap-2"><span className="text-emerald-500">✔</span> Pembuatan Judul & Bab 1-3</li>
               <li className="text-sm text-slate-700 flex items-center gap-2"><span className="text-emerald-500">✔</span> Revisi Terstruktur</li>
             </ul>
           </div>
           <button onClick={() => openForm('Paket Proposal', 'Rp1.850.000')} className="w-full py-3.5 bg-slate-50 text-emerald-700 font-bold rounded-xl border border-slate-200 hover:bg-emerald-50 transition-colors group-hover:border-emerald-200">
             Pesan Rp1.850.000
           </button>
        </div>

        {/* Paket Complete */}
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

        {/* Paket Semhas */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all group">
           <div>
             <h3 className="text-lg font-bold text-slate-800 mb-2">Paket Semhas</h3>
             <p className="text-xs text-slate-500 mb-6 leading-relaxed">Melanjutkan pengerjaan Bab 4 dan 5 setelah sidang proposal.</p>
             <ul className="space-y-3 mb-8">
               <li className="text-sm text-slate-700 flex items-center gap-2"><span className="text-emerald-500">✔</span> Olah Data Penelitian</li>
               <li className="text-sm text-slate-700 flex items-center gap-2"><span className="text-emerald-500">✔</span> Bab 4 - 5 & Pendampingan Sidang</li>
             </ul>
           </div>
           <button onClick={() => openForm('Paket Semhas', 'Rp4.200.000')} className="w-full py-3.5 bg-slate-50 text-emerald-700 font-bold rounded-xl border border-slate-200 hover:bg-emerald-50 transition-colors group-hover:border-emerald-200">
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

      {/* Modal Form Pendaftaran */}
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