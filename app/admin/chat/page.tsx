'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';

type ChatSession = {
  id: string;
  user_id: string;
  user_name: string; // Didapat dari relasi
  stage: string;
  created_at: string;
};

type Message = {
  id: string;
  session_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

export default function AnalystChatManagement() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [rooms, setRooms] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Ambil Daftar Sesi Chat (Rooms) milik Analis ini
  useEffect(() => {
    const fetchRooms = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setCurrentUserId(session.user.id);

      // Cari ID profil analis dari user yang login
      const { data: analystProfile } = await supabase
        .from('analyst_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!analystProfile) {
        setIsLoading(false);
        return;
      }

      // Cari semua sesi chat yang terhubung ke analis ini
      const { data: sessions } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('analyst_id', analystProfile.id)
        .order('created_at', { ascending: false });

      if (sessions && sessions.length > 0) {
        // Ambil email/nama user secara aman tanpa resiko error JOIN
        const userIds = [...new Set(sessions.map(s => s.user_id))];
        const { data: usersData } = await supabase
          .from('users_data')
          .select('id, email')
          .in('id', userIds);

        const formattedRooms = sessions.map(s => {
          const user = usersData?.find(u => u.id === s.user_id);
          return {
            ...s,
            user_name: user?.email?.split('@')[0] || 'Mahasiswa'
          };
        });
        setRooms(formattedRooms);
      }
      setIsLoading(false);
    };

    fetchRooms();
  }, []);

  // 2. Ambil Pesan & Aktifkan Realtime saat Room dipilih
  useEffect(() => {
    let channel: any;

    const fetchMessages = async () => {
      if (!activeSession) return;
      
      // Load pesan historis
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', activeSession.id)
        .order('created_at', { ascending: true });
        
      if (data) setMessages(data);

      // Subscribe ke pesan baru secara realtime
      channel = supabase
        .channel(`chat_room_${activeSession.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${activeSession.id}` },
          (payload) => {
             const newMsg = payload.new as Message;
             setMessages(prev => {
               if (prev.some(m => m.id === newMsg.id)) return prev;
               return [...prev, newMsg];
             });
          }
        )
        .subscribe();
    };

    fetchMessages();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeSession]);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeSession || !currentUserId) return;

    const textToSend = inputText.trim();
    setInputText(''); // Kosongkan input seketika

    const { data: insertedMsg, error } = await supabase
      .from('chat_messages')
      .insert({
         session_id: activeSession.id,
         sender_id: currentUserId,
         message: textToSend
      })
      .select()
      .single();

    if (error) {
      alert("Gagal mengirim pesan.");
      setInputText(textToSend);
    } else if (insertedMsg) {
      setMessages(prev => {
        if (prev.some(m => m.id === insertedMsg.id)) return prev;
        return [...prev, insertedMsg];
      });
    }
  };

  const handleLihatSkripsi = async () => {
    if (!activeSession) return;
    const { data } = await supabase
      .from('history_skripsi')
      .select('judul, created_at')
      .eq('user_id', activeSession.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data) alert(`Dokumen Terakhir Klien:\n\nJudul: ${data.judul}\nDibuat: ${new Date(data.created_at).toLocaleDateString('id-ID')}`);
    else alert('Mahasiswa ini belum menyimpan dokumen skripsi.');
  };

  if (isLoading) return <div className="h-full flex items-center justify-center bg-white"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div></div>;

  return (
    <div className="flex h-full w-full bg-white divide-x divide-slate-200">
      
      {/* SIDEBAR KIRI: DAFTAR KLIEN */}
      <div className={`${activeSession ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 h-full bg-slate-50/50 shrink-0`}>
        <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Pesan Masuk</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">{rooms.length} Sesi Aktif</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {rooms.map(room => (
            <div 
              key={room.id} 
              onClick={() => setActiveSession(room)}
              className={`p-3 rounded-xl cursor-pointer transition-all flex gap-3 items-center border ${activeSession?.id === room.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-100'}`}
            >
              <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-slate-600 font-bold">
                {room.user_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800 truncate">{room.user_name}</h3>
                <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mt-0.5">Tahap: {room.stage}</p>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm font-medium">Belum ada chat masuk.</div>
          )}
        </div>
      </div>

      {/* AREA KANAN: RUANG OBROLAN */}
      {activeSession ? (
        <div className="flex-1 flex flex-col h-full bg-[#FAFAFC] relative min-w-0">
          
          <div className="h-16 px-4 md:px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveSession(null)} className="md:hidden text-slate-500 p-2 -ml-2 rounded-lg hover:bg-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">{activeSession.user_name.charAt(0).toUpperCase()}</div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 leading-none mb-1">{activeSession.user_name}</h2>
                <span className="text-[10px] font-semibold text-emerald-600 inline-flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Klien Aktif</span>
              </div>
            </div>
            <button onClick={handleLihatSkripsi} className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors">
              Lihat Skripsi
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/50">
            <div className="flex justify-center mb-2">
              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg">Sesi Terhubung secara Real-Time</span>
            </div>
            {messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                  <div className={`max-w-[85%] md:max-w-[70%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'}`}>
                    {msg.message.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 mt-1 px-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          <div className="p-3 md:p-4 bg-white border-t border-slate-200 shrink-0 pb-safe">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Balas pesan klien..." 
                className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none min-h-[44px] max-h-32 custom-scrollbar transition-all"
                rows={1}
              />
              <button type="submit" disabled={!inputText.trim()} className="h-11 w-11 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 shrink-0 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
              </button>
            </form>
          </div>

        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50 border-l border-slate-200/50">
          <div className="h-24 w-24 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-300 shadow-sm mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.84 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Ruang Kerja Analis</h3>
          <p className="text-slate-500 text-sm max-w-xs text-center font-medium">Pilih obrolan dari daftar di sebelah kiri untuk membalas klien.</p>
        </div>
      )}
    </div>
  );
}