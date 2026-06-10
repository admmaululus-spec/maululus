"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase"; // Perbaikan jalur import
import Link from "next/link";

export default function AnalystDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    // Idealnya di sini ada Middleware Next.js untuk mengecek role = 'analyst'
    const fetchSessions = async () => {
      // Perbaikan: gunakan object 'supabase' secara langsung
      const { data } = await supabase
        .from("consultations")
        .select("id, topic, status, created_at, profiles!user_id(full_name)")
        .order("created_at", { ascending: false });
      
      if (data) setSessions(data);
    };
    fetchSessions();
  }, []);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-brand-navy mb-8">Dashboard Analis - Antrean Konsultasi</h1>
      
      <div className="grid gap-4">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-brand-emerald flex justify-between items-center">
            <div>
              {/* Pastikan relasi tabel antara 'consultations' dan 'profiles' sudah benar di database */}
              <h3 className="font-bold text-lg">{session.profiles?.full_name || "Mahasiswa Anonim"}</h3>
              <p className="text-gray-600 text-sm">Topik: {session.topic}</p>
            </div>
            <Link 
              href={`/konsultasi/${session.id}`} 
              className="bg-brand-navy hover:bg-blue-900 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Balas Chat
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}