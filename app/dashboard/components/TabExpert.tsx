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
        supabase.from('app_settings').select('value').eq('key', 'koin_rate').single()
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

      const orderId = `EXP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          gross_amount: finalPrice,
          first_name: form.nama,
          email: session.user.email,
          phone: form.no_whatsapp,
          item_name: selectedPaket.nama
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      (window as any).snap.pay(data.token, {
        onSuccess: async function(result: any) {
          if (useKoin && koinTerpotong > 0) {
            await supabase.from('users_data').update({ koin: koin - koinTerpotong }).eq('id', session.user.id);
          }

          // Catat transaksi
          await supabase.from('transactions').insert({
            user_id: session.user.id,
            user_email: session.user.email,
            paket_nama: selectedPaket.nama,
            koin_jumlah: useKoin ? -(koinTerpotong) : 0, 
            harga_rp: finalPrice,
            metode: 'Midtrans Gateway',
            status: 'SUCCESS'
          });

          // Insert ke Proyek (Sekarang dengan Error Handling Kuat)
          const { error: projectError } = await supabase.from('premium_projects').insert({
            id: orderId,
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
            is_active: true,
            checklist: [] // Tipe JSONB yang ada di Supabase
          });

          if (projectError) {
            console.error("Gagal simpan proyek:", projectError);
            alert(`PENTING: Pembayaran berhasil, tapi terjadi error simpan data (${projectError.message}). Harap lapor ke admin segera!`);
          } else {
            alert("Pembayaran Lunas & Proyek Berhasil Dibuat! Kamu akan diarahkan ke WhatsApp Admin.");
          }

          // Redirect ke WhatsApp
          const waNumber = '6285815999953';
          const waMessage = encodeURIComponent(`Halo Admin Maululus, pesanan Expert Assistance atas nama *${form.nama}* telah berhasil dibayar.\n\n*Paket:* ${selectedPaket.nama}\n*Order ID:* ${orderId}\n\nMohon segera diproses ya!`);
          window.location.href = `https://wa.me/${waNumber}?text=${waMessage}`;
        },
        onPending: function(result: any) {
          alert("Menunggu pembayaran Anda diselesaikan!");
        },
        onError: function(result: any) {
          alert("Pembayaran gagal!");
          setLoading(false);
        },
        onClose: function() {
          setLoading(false);
        }
      });

    } catch (err: any) {
      alert("Gagal memproses: " + err.message);
      setLoading(false);
    }
  };

  const formatRp = (angka: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

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
        {packages.map((pkg, idx) => (
          <div key={pkg.id} className={`bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all z-10${idx === 1 ? 'bg-[#0B1525] border-blue-900 shadow-xl transform lg:-translate-y-4'  : ''}`}>
             <div>
               <div className="flex items-center justify-between mb-2">
                 <h3 className={`text-lg font-bold ${idx === 1 ? 'text-black' : 'text-slate-800'}`}>{pkg.nama}</h3>
                 {idx === 1 && <span className="bg-amber-400 text-amber-950 text-[9px] font-bold px-2 py-1 rounded-md">BEST SELLER</span>}
               </div>
               <p className={`text-xs mb-6 leading-relaxed ${idx === 1 ? 'text-slate-400' : 'text-slate-500'}`}>{pkg.deskripsi}</p>
               <ul className="space-y-3 mb-8">
                 {pkg.fitur?.map((f: string, i: number) => (
                   <li key={i} className={`text-sm flex items-center gap-2 ${idx === 1 ? 'text-black' : 'text-slate-700'}`}><span className="text-emerald-500">✔</span> {f}</li>
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
                  {loading ? 'Memproses Gateway...' : '💳 Bayar via Midtrans'}
                </button>
                <p className="text-[9px] text-center text-slate-400 mt-4">Pilih QRIS, GoPay, atau Virtual Account Bank.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}