'use client';
import React from 'react';
import Link from 'next/link';
import { CoinIcon, WalletIcon, ReceiptIcon, SparklesIcon } from './IconsAndUI';

export function TabKoin({ koin, riwayatList }: any) {
  // Ambil aktivitas AI Tools untuk simulasi riwayat pemotongan koin
  const riwayatTransaksi = riwayatList.filter((item: any) => item.tool_name).slice(0, 8);

  return (
    <div className="animate-in fade-in max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><CoinIcon /></span>
        <h2 className="text-2xl font-extrabold text-slate-800">Saldo Koin</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kartu Saldo Utama */}
        <div className="md:col-span-1 bg-gradient-to-br from-[#0B1525] to-[#1a2d4c] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-[250px]">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-48 h-48"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.1-.96-2.15-1.64H8.04c.05 1.63 1.25 2.66 2.86 2.98V19h2.34v-1.67c1.7-.32 2.95-1.32 2.95-3.03 0-2.14-1.73-2.79-3.88-3.16z"/></svg>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Total Koin Tersedia</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl">🪙</span>
              <span className="text-5xl font-black">{koin}</span>
            </div>
          </div>
          <div className="relative z-10">
            <button onClick={() => document.getElementById('topup')?.click()} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg">
              + Top Up Koin
            </button>
          </div>
        </div>

        {/* Tabel Riwayat Transaksi */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><ReceiptIcon /> Riwayat Pemakaian</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Tanggal</th>
                  <th className="px-4 py-3">Aktivitas / Fitur</th>
                  <th className="px-4 py-3 text-right rounded-tr-xl">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {riwayatTransaksi.length > 0 ? riwayatTransaksi.map((item: any, idx: number) => {
                  let deduct = 1;
                  if (item.tool_name === 'Turnitin') deduct = 20;
                  if (item.tool_name === 'Parafrase' || item.tool_name === 'AI Draft Writer') deduct = 15;
                  if (item.tool_name === 'Cari Jurnal' || item.tool_name === 'Buat Judul') deduct = 5;
                  if (item.tool_name === 'Ringkasan Jurnal') deduct = 3;
                  if (item.tool_name === 'Sitasi' || item.tool_name === 'Academic Style') deduct = 2;

                  return (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700 flex items-center gap-2">
                        <span className="text-blue-500"><SparklesIcon /></span> Pemakaian {item.tool_name}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600">- {deduct} Koin</td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-xs">Belum ada riwayat transaksi penggunaan koin.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TabTopup({ koin }: any) {
  return (
    <div className="animate-in fade-in max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><WalletIcon /></span>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">Top Up Koin</h2>
            <p className="text-sm text-slate-500">Pilih paket koin untuk menggunakan seluruh fitur AI Tools.</p>
          </div>
        </div>
        <div className="hidden md:flex bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl items-center gap-2">
          <span className="text-amber-500 text-lg">🪙</span>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Saldo Tersedia</p>
            <p className="text-sm font-black text-slate-800">{koin} Koin</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Paket Basic */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-blue-300 transition-colors flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Paket Hemat</h3>
            <p className="text-[10px] text-slate-500 mb-6">Cocok untuk revisi ringan.</p>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-4xl font-black text-slate-800">100</span>
              <span className="text-sm font-bold text-slate-500 mb-1">Koin</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="text-xs text-slate-600 flex items-center gap-2"><span className="text-blue-500">✔</span> Akses semua AI Tools</li>
              <li className="text-xs text-slate-600 flex items-center gap-2"><span className="text-blue-500">✔</span> ± 6x Parafrase Bab</li>
              <li className="text-xs text-slate-600 flex items-center gap-2"><span className="text-blue-500">✔</span> 5x Cek Turnitin</li>
            </ul>
          </div>
          <button className="w-full bg-slate-50 border border-slate-200 text-blue-700 font-bold py-3.5 rounded-xl hover:bg-slate-100 transition-colors">
            Beli Rp 49.000
          </button>
        </div>

        {/* Paket Best Seller */}
        <div className="bg-[#0B1525] border border-blue-900 rounded-3xl p-6 shadow-xl flex flex-col justify-between transform md:-translate-y-4 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-400 text-amber-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
            Paling Populer
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1 mt-2">Paket Mahasiswa</h3>
            <p className="text-[10px] text-slate-400 mb-6">Disarankan untuk pengerjaan skripsi aktif.</p>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-4xl font-black text-amber-400">250</span>
              <span className="text-sm font-bold text-slate-400 mb-1">Koin</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="text-xs text-slate-300 flex items-center gap-2"><span className="text-amber-400">✔</span> Akses semua AI Tools</li>
              <li className="text-xs text-slate-300 flex items-center gap-2"><span className="text-amber-400">✔</span> Bebas Generate Draft AI</li>
              <li className="text-xs text-slate-300 flex items-center gap-2"><span className="text-amber-400">✔</span> Kuota Turnitin Berlimpah</li>
            </ul>
          </div>
          <button className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30">
            Beli Rp 99.000
          </button>
        </div>

        {/* Paket Pro */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-blue-300 transition-colors flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Paket Sultan</h3>
            <p className="text-[10px] text-slate-500 mb-6">Bebas khawatir kehabisan saldo koin.</p>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-4xl font-black text-slate-800">600</span>
              <span className="text-sm font-bold text-slate-500 mb-1">Koin</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="text-xs text-slate-600 flex items-center gap-2"><span className="text-blue-500">✔</span> Akses Tanpa Batas</li>
              <li className="text-xs text-slate-600 flex items-center gap-2"><span className="text-blue-500">✔</span> Cocok untuk pengerjaan Tesis</li>
              <li className="text-xs text-slate-600 flex items-center gap-2"><span className="text-blue-500">✔</span> Koin tidak ada masa hangus</li>
            </ul>
          </div>
          <button className="w-full bg-slate-50 border border-slate-200 text-blue-700 font-bold py-3.5 rounded-xl hover:bg-slate-100 transition-colors">
            Beli Rp 199.000
          </button>
        </div>
      </div>
    </div>
  );
}