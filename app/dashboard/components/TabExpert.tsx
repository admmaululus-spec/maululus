// app/dashboard/components/TabExpert.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { AcademicCapIcon, UserTieIcon, ChartLineIcon, RefreshIcon, ChatBubbleIcon } from './IconsAndUI';

export default function TabExpert({ riwayatList = [], koin, userId }: any) {
  const [packages, setPackages] = useState<any[]>([]);
  const [koinRate, setKoinRate] = useState(500);
  const [showModal, setShowModal] = useState(false);
  const [selectedPaket, setSelectedPaket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nama: '', nim: '', univ: '', jurusan: '', no_whatsapp: '', judul: '' });
  const [useKoin, setUseKoin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [pkgRes, rateRes] = await Promise.all([
        supabase.from('expert_packages').select('*').order('harga', { ascending: true }),
        supabase.from('app_settings').select('value').eq('key', 'koin_rate').maybeSingle()
      ]);
      if (pkgRes.data) setPackages(pkgRes.data);
      if (rateRes.data) setKoinRate(parseInt(rateRes.data.value));
    };
    fetchData();
  }, []);

  // Kalkulasi Harga Dinamis & Potongan Koin
  const maxDiskonKoin = koin * koinRate;
  const nominalDiskon = useKoin ? (maxDiskonKoin > selectedPaket?.harga ? selectedPaket?.harga : maxDiskonKoin) : 0;
  const finalPrice = selectedPaket ? selectedPaket.harga - nominalDiskon : 0;
  const koinTerpotong = useKoin ? Math.ceil(nominalDiskon / koinRate) : 0;

  const handleOrderPayment = async () => {
    if (!form.nama || !form.no_whatsapp || !form.judul) return alert("Nama, No WhatsApp, dan Judul Skripsi wajib diisi!");
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Silakan login kembali.");

      const orderId = `EXPERT-${Date.now()}`;
      const waNumber = '6282120002589';

      // Format Pesan Pembelian Expert
      let waMessage = `Halo Admin Maululus, saya ingin memesan layanan Expert Assistance.\n\n`;
      waMessage += `*Data Pemesan:*\n- Nama: ${form.nama}\n- WhatsApp: ${form.no_whatsapp}\n- NIM: ${form.nim || '-'}\n- Universitas: ${form.univ || '-'}\n- Jurusan: ${form.jurusan || '-'}\n- Judul Skripsi: ${form.judul}\n\n`;
      
      waMessage += `*Detail Pesanan:*\n- Paket: ${selectedPaket.nama}\n- Order ID: ${orderId}\n`;
      waMessage += `- Harga Normal: ${formatRp(selectedPaket.harga)}\n`;
      
      if (useKoin) {
        waMessage += `- Diskon Koin: -${formatRp(nominalDiskon)} (Tukar ${koinTerpotong} Koin)\n`;
      }
      
      waMessage += `- *Total Pembayaran: ${formatRp(finalPrice)}*\n\n`;
      waMessage += `Mohon panduannya untuk melakukan pembayaran manual.`;

      // Buka tab WhatsApp
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`, '_blank');
      
      setLoading(false);
      setShowModal(false);
    } catch (err: any) {
      alert("Gagal memproses pesanan: " + err.message);
      setLoading(false);
    }
  };

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

  return (
    <div className="animate-in fade-in max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-3 mb-6"> {/* Perbesar margin bawah header menjadi mb-6 */}
        <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><AcademicCapIcon /></span>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Expert Assistance</h2>
          <p className="text-sm text-slate-500">Layanan premium pendampingan penyusunan skripsi 1-on-1.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {packages.map((pkg, idx) => (
          <div 
            key={pkg.id} 
            // PERBAIKAN CLASS: Pisahkan bg-white agar tidak menumpuk, dan beri jarak spasi yang benar
            className={`border rounded-3xl p-8 shadow-sm flex flex-col justify-between transition-all z-10 ${
              idx === 1 
                ? 'bg-[#0B1525] border-blue-900 shadow-xl transform lg:-translate-y-2' 
                : 'bg-white border-slate-200 hover:border-emerald-200'
            }`}
          >
             <div>
               <div className="flex items-center justify-between mb-2">
                 <h3 className={`text-lg font-bold ${idx === 1 ? 'text-white' : 'text-slate-800'}`}>{pkg.nama}</h3>
                 {idx === 1 && <span className="bg-amber-400 text-amber-950 text-[9px] font-bold px-2 py-1 rounded-md">BEST SELLER</span>}
               </div>
               <p className={`text-xs mb-6 leading-relaxed ${idx === 1 ? 'text-slate-400' : 'text-slate-500'}`}>{pkg.deskripsi}</p>
               <ul className="space-y-3 mb-8">
                 {pkg.fitur?.map((f: string, i: number) => (
                   <li key={i} className={`text-sm flex items-center gap-2 ${idx === 1 ? 'text-white' : 'text-slate-700'}`}>
                     <span className="text-emerald-500">✔</span> {f}
                   </li>
                 ))}
               </ul>
             </div>
             <button onClick={() => { setSelectedPaket(pkg); setShowModal(true); }} className={`w-full py-3.5 font-bold rounded-xl transition-colors ${idx === 1 ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg' : 'bg-slate-50 text-emerald-700 border border-slate-200 hover:bg-emerald-50'}`}>
               Pesan {formatRp(pkg.harga)}
             </button>
          </div>
        ))}
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
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[90vh] overflow-y-auto">
            
            {/* Bagian Kiri: Form Identitas */}
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-4">Data Klien</h3>
              <div className="space-y-3">
                 <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} placeholder="Nama Lengkap KTP/KTM" />
                 <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500" value={form.no_whatsapp} onChange={e => setForm({...form, no_whatsapp: e.target.value})} placeholder="No WhatsApp Aktif" />
                 <div className="grid grid-cols-2 gap-3">
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500" value={form.nim} onChange={e => setForm({...form, nim: e.target.value})} placeholder="NIM" />
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500" value={form.univ} onChange={e => setForm({...form, univ: e.target.value})} placeholder="Universitas" />
                 </div>
                 <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500" value={form.jurusan} onChange={e => setForm({...form, jurusan: e.target.value})} placeholder="Fakultas / Jurusan" />
                 
                 <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500" onChange={e => setForm({...form, judul: e.target.value})}>
                   <option value="">-- Pilih Judul AI / Ketik di bawah --</option>
                   {riwayatList.filter((r:any) => !r.tool_name).map((r:any) => (
                      <option key={r.id} value={r.judul}>{r.judul.substring(0, 50)}...</option>
                   ))}
                 </select>
                 <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs resize-none h-20 outline-none focus:border-blue-500" placeholder="Judul Skripsi..." value={form.judul} onChange={e => setForm({...form, judul: e.target.value})}></textarea>
              </div>
            </div>

            {/* Bagian Kanan: Tagihan & Checkout */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div>
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white text-slate-400 rounded-full shadow-sm hover:text-rose-600 hover:bg-rose-50 transition-colors">✕</button>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ringkasan Tagihan</h3>
                <div className="flex justify-between text-sm mb-2 text-slate-700"><span>{selectedPaket?.nama}</span><span className="font-bold">{formatRp(selectedPaket?.harga)}</span></div>
                
                {koin > 0 && (
                  <label className="flex items-center gap-3 mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100/50 transition-colors">
                    <input type="checkbox" checked={useKoin} onChange={(e) => setUseKoin(e.target.checked)} className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"/>
                    <span className="text-xs text-amber-800 font-semibold">Tukar {koin} Koin (Diskon {formatRp(maxDiskonKoin)})</span>
                  </label>
                )}
                {useKoin && <div className="flex justify-between text-sm mt-3 text-emerald-600 font-bold border-b border-emerald-100 pb-3"><span>Potongan Koin</span><span>- {formatRp(nominalDiskon)}</span></div>}
              </div>
              
              <div className="mt-4 pt-2">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-sm font-bold text-slate-500">Total Bayar</span>
                  <span className="text-2xl font-black text-blue-700">{formatRp(finalPrice)}</span>
                </div>
                <button onClick={handleOrderPayment} disabled={loading} className="w-full bg-[#00A859] hover:bg-[#00924e] active:scale-95 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2">
                  {loading ? 'Mengalihkan...' : '💬 Lanjut ke WhatsApp Admin'}
                </button>
                <p className="text-[9px] text-center text-slate-400 mt-4">Transaksi diproses aman melalui admin resmi Maululus.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}