'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type ChatSession = {
  id: string;
  user_id: string;
  analyst_id: string;
  payment_status: string;
  stage: string;
  updated_at: string;
  user_email?: string; // Virtual
  last_message?: string; // Virtual
};

type Message = {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

export default function AnalystInbox() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [analystProfileId, setAnalystProfileId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // INISIALISASI DATA & SESSIONS
  useEffect(() => {
    const initAnalyst = async () => {
      // 1. Cek Login User
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) { router.push('/auth'); return; }
      
      const userId = authSession.user.id;
      setCurrentUserId(userId);

      // 2. Ambil ID Profil Analis berdasarkan User ID
      const { data: profile } = await supabase.from('analyst_profiles').select('id').eq('user_id', userId).single();
      if (!profile) {
        alert("Akses ditolak. Anda bukan analis yang terdaftar.");
        router.push('/dashboard');
        return;
      }
      setAnalystProfileId(profile.id);

      // 3. Ambil Daftar Sesi Chat (Inbox)
      const { data: sessionsData } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('analyst_id', profile.id)
        .order('updated_at', { ascending: false });

      if (sessionsData && sessionsData.length > 0) {
        // Ambil email mahasiswa untuk UI (manual join karena strict RLS)
        const enrichedSessions = await Promise.all(sessionsData.map(async (s) => {
          const { data: uProfile } = await supabase.from('profiles').select('email').eq('id', s.user_id).maybeSingle();
          
          // Ambil pesan terakhir untuk preview
          const { data: lastMsg } = await supabase.from('chat_messages').select('message').eq('session_id', s.id).order('created_at', { ascending: false }).limit(1).maybeSingle();

          return { 
            ...s, 
            user_email: uProfile?.email || 'Mahasiswa',
            last_message: lastMsg?.message || 'Belum ada pesan.'
          };
        }));

        setSessions(enrichedSessions);
        setActiveSession(enrichedSessions[0]); // Auto-buka chat pertama
      }
      setIsLoading(false);
    };

    initAnalyst();
  }, [router]);

  // SUBSCRIPTION REALTIME UNTUK PESAN (Ketika Active Session Berubah)
  useEffect(() => {
    if (!activeSession) return;

    const fetchMessages = async () => {
      const { data } = await supabase.from('chat_messages').select('*').eq('session_id', activeSession.id).order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // Dengarkan pesan masuk baru
    const channel = supabase
      .channel(`chat_${activeSession.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${activeSession.id}` }, 
      (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => {
          // Cegah duplikasi pesan (karena pengirim juga memicu event)
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeSession]);

  // HANDLER KIRIM PESAN
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeSession || !currentUserId) return;

    setIsSending(true);
    const textToSend = messageInput;
    setMessageInput(''); // Kosongkan input agar UI cepat

    const { data: newMsg, error } = await supabase.from('chat_messages').insert([
      { session_id: activeSession.id, sender_id: currentUserId, message: textToSend }
    ]).select().single();

    if (error) {
      alert('Gagal mengirim pesan');
      setMessageInput(textToSend);
    } else {
      // Update waktu 'updated_at' di chat_sessions agar naik ke atas inbox
      await supabase.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', activeSession.id);
    }
    setIsSending(false);
  };

  // HANDLER UPDATE STAGE (Fitur Nomor 5)
  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value;
    if (!activeSession) return;

    const { error } = await supabase.from('chat_sessions').update({ stage: newStage }).eq('id', activeSession.id);
    if (!error) {
      setActiveSession({ ...activeSession, stage: newStage });
      setSessions(sessions.map(s => s.id === activeSession.id ? { ...s, stage: newStage } : s));
      alert(`Tahap skripsi berhasil diperbarui menjadi: ${newStage}`);
    } else {
      alert("Gagal memperbarui tahapan.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0D1C2E] border-t-transparent"></div></div>;

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      
      {/* COLUMN 1: SIDEBAR NAVIGASI KIRI */}
      <div className="w-16 bg-[#0D1C2E] flex flex-col items-center py-6 gap-6 shrink-0 z-20 shadow-xl">
        <div className="h-10 w-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg">M</div>
        <button className="text-emerald-400 bg-white/10 p-3 rounded-xl relative hover:bg-white/20 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>
          <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-[#0D1C2E]"></span>
        </button>
        <button onClick={handleLogout} className="mt-auto text-slate-400 hover:text-red-400 transition-colors p-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
        </button>
      </div>

      {/* COLUMN 2: DAFTAR CHAT MASUK */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50 shrink-0">
        <div className="p-6 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-extrabold text-[#0D1C2E] mb-4">Inbox Klien</h2>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-4 top-3.5 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input type="text" placeholder="Cari mahasiswa..." className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">Belum ada mahasiswa yang memulai konsultasi.</div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} onClick={() => setActiveSession(session)} className={`p-5 cursor-pointer border-b border-slate-100 transition-colors ${activeSession?.id === session.id ? 'bg-white border-l-4 border-l-emerald-500 shadow-sm' : 'hover:bg-slate-100 border-l-4 border-l-transparent'}`}>
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate pr-2">{session.user_email?.split('@')[0]}</h3>
                  <span className="text-[10px] text-slate-400 shrink-0">{new Date(session.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mb-2">{session.last_message}</p>
                <div className="flex gap-2">
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">{session.payment_status}</span>
                  <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest truncate max-w-[100px]">{session.stage}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* COLUMN 3: JENDELA OBROLAN UTAMA */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC]">
        {activeSession ? (
          <>
            {/* Header Chat */}
            <div className="h-20 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm z-10 shrink-0">
              <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg mr-4 border border-slate-200">
                {activeSession.user_email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">{activeSession.user_email?.split('@')[0]}</h2>
                <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Online</p>
              </div>
            </div>

            {/* Area Pesan Chat */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-4">
              <div className="flex justify-center mb-6">
                <span className="bg-slate-200/60 text-slate-500 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Konsultasi Dimulai
                </span>
              </div>

              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-5 py-3.5 text-sm shadow-sm ${
                      isMe 
                        ? 'bg-[#0D1C2E] text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'
                    }`}>
                      {msg.message}
                      <div className={`text-[9px] mt-1.5 text-right ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Pesan Bawah */}
            <div className="p-6 bg-white border-t border-slate-200 shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Ketik balasan untuk mahasiswa..." 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={isSending}
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" 
                />
                <button 
                  type="submit" 
                  disabled={!messageInput.trim() || isSending}
                  className="text-white bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 h-12 w-12 rounded-full flex items-center justify-center transition-colors shadow-md shrink-0"
                >
                  {isSending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 mb-4 opacity-20"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.47-2.25 8.567 8.567 0 01-2.34-4.72C2.457 13.626 2.25 12.83 2.25 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
            <p className="font-medium">Pilih pesan di samping untuk mulai membalas.</p>
          </div>
        )}
      </div>

      {/* COLUMN 4: PANEL DETAIL & STATUS (Kanan) */}
      {activeSession && (
        <div className="w-80 bg-white border-l border-slate-200 p-8 flex flex-col overflow-y-auto shrink-0 z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col items-center mb-10">
            <div className="h-24 w-24 rounded-full bg-slate-100 border-4 border-white shadow-md text-slate-600 flex items-center justify-center font-black text-4xl mb-4">
              {activeSession.user_email?.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-extrabold text-slate-900 text-xl">{activeSession.user_email?.split('@')[0]}</h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Klien Mahasiswa</p>
          </div>

          {/* Lead Stage / Progress Staging */}
          <div className="mb-8">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Progress Skripsi (Stage)</h3>
            <select 
              value={activeSession.stage} 
              onChange={handleStageChange}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block p-3.5 font-bold outline-none cursor-pointer transition-all"
            >
              <option value="Baru Mulai">Baru Mulai (Lead)</option>
              <option value="Review Dokumen">Review Dokumen</option>
              <option value="Revisi Bab 1-3">Revisi Bab 1-3</option>
              <option value="Revisi Bab 4-5">Revisi Bab 4-5</option>
              <option value="Selesai">Selesai (Lulus)</option>
            </select>
          </div>

          {/* Fitur CRUD Dokumen (Pintasan Kolaborasi) */}
          <div className="border-t border-slate-100 pt-8">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Dokumen Kolaborasi</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">Akses dan edit dokumen skripsi bersama mahasiswa secara real-time.</p>
            
            <Link 
              href={`/dashboard/dokumen?session=${activeSession.id}`} 
              className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold py-3.5 rounded-xl hover:bg-emerald-100 transition-colors flex justify-center items-center gap-2 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              Buka Editor Dokumen
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}