'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

type SkripsiData = { id: string; user_id: string; judul: string; is_unlocked: boolean; created_at: string };

export default function AdminSkripsiPage() {
  const [skripsiList, setSkripsiList] = useState<SkripsiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSkripsi = async () => {
      const { data } = await supabase.from('history_skripsi').select('id, user_id, judul, is_unlocked, created_at').order('created_at', { ascending: false });
      if (data) setSkripsiList(data);
      setIsLoading(false);
    };
    fetchSkripsi();
  }, []);

  if (isLoading) return <div className="text-slate-400 font-bold animate-pulse">Memuat database dokumen...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Database Skripsi</h1>
        <p className="text-slate-500 mt-1 text-sm">Seluruh dokumen hasil generate AI yang disimpan pengguna.</p>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Tanggal</th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Judul Skripsi</th>
                <th className="px-6 py-4 font-bold text-slate-800 uppercase tracking-wider text-[10px]">Status Buka</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skripsiList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-500">
                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 leading-snug">{item.judul}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">User: {item.user_id.substring(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4">
                    {item.is_unlocked ? (
                      <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">Terbuka</span>
                    ) : (
                      <span className="bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">Terkunci</span>
                    )}
                  </td>
                </tr>
              ))}
              {skripsiList.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400">Belum ada dokumen skripsi dibuat.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}