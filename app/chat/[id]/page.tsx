'use client';
export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

type Message = {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

type SessionDetail = {
  id: string;
  stage: string;
  analyst_id: string;
  analyst_profiles: {
    name: string;
    photo_url: string;
    expertise?: string;
  };
};

export default function UserChatRoom() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke pesan terbawah
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let channel: any;

    const initChat = async () => {
      // 1. Dapatkan ID User yang sedang login
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) {
        router.replace('/auth');
        return;
      }
      setCurrentUserId(authSession.user.id);

      // 2. Ambil detail sesi chat dan data analis (Join table)
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select(`
          id, 
          stage, 
          analyst_id,
          analyst_profiles ( name, photo_url, expertise )
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        alert('Sesi chat tidak valid atau Anda tidak memiliki akses.');
        router.replace('/dashboard');
        return;
      }
      
      // @ts-ignore (Mengabaikan peringatan tipe relasi tunggal Supabase)
      setSessionDetail(sessionData);

      // 3. Ambil riwayat pesan
      const { data: messagesData } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messagesData) setMessages(messagesData);
      setIsLoading(false);

      // 4. Aktifkan Supabase Realtime untuk mendengarkan pesan baru
      channel = supabase
        .channel(`chat_room_${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            // Cegah duplikasi jika pesan ini adalah pesan yang baru saja kita kirim
            setMessages((prev) => {
              if (prev.some((msg) => msg.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        )
        .subscribe();
    };

    if (sessionId) initChat();

    // Cleanup subscription saat komponen ditutup/pindah halaman
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [sessionId, router]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    setIsSending(true);
    const textToSend = newMessage.trim();
    setNewMessage(''); // Kosongkan input agar UI terasa responsif (Optimistic feeling)

    const { data: insertedMsg, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          session_id: sessionId,
          sender_id: currentUserId,
          message: textToSend,
        },
      ])
      .select()
      .single();

    if (error) {
      alert('Gagal mengirim pesan, periksa koneksi internet Anda.');
      setNewMessage(textToSend); // Kembalikan teks jika gagal kirim
    } else if (insertedMsg) {
      // Masukkan ke state lokal segera setelah sukses disimpan di DB
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === insertedMsg.id)) return prev;
        return [...prev, insertedMsg];
      });
    }
    
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Kirim pesan jika Enter ditekan tanpa Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#F4F5F7] max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
      
      {/* HEADER CHAT (Tema Mahasiswa - Emerald/Teal) */}
      <header className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </Link>
          <div className="relative">
            <img 
              src={sessionDetail?.analyst_profiles?.photo_url || 'https://via.placeholder.com/40'} 
              alt="Analis" 
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm leading-tight">{sessionDetail?.analyst_profiles?.name || 'Pakar Analis'}</h1>
            <p className="text-[10px] font-semibold text-emerald-600 truncate max-w-[150px] sm:max-w-[200px]">
              {sessionDetail?.analyst_profiles?.expertise || 'Konsultan Akademik'}
            </p>
          </div>
        </div>
        
        {/* Status Stage */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Sesi Aktif</span>
        </div>
      </header>

      {/* AREA PESAN DENGAN BACKGROUND PATTERN */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/50">
        
        {/* Enkripsi Notice */}
        <div className="flex justify-center mb-2 mt-2">
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 text-center max-w-xs leading-relaxed">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 shrink-0"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" /></svg>
            Sesi konsultasi {sessionDetail?.stage ? `tahap ${sessionDetail.stage}` : 'ini'} telah dimulai. Pesan dilindungi.
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
              <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                isMe 
                  ? 'bg-emerald-500 text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'
              }`}>
                {msg.message.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </div>
              <span className={`text-[9px] font-semibold text-slate-400 mt-1 px-1 transition-opacity opacity-70 group-hover:opacity-100`}>
                {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-1" /> {/* Anchor untuk auto-scroll */}
      </main>

      {/* INPUT FORM BAWAH */}
      <footer className="bg-white p-3 sm:p-4 border-t border-slate-200 shrink-0 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.02)] pb-safe">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan... (Shift+Enter untuk baris baru)"
            className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white transition-all text-slate-800 resize-none min-h-[44px] max-h-32 custom-scrollbar"
            disabled={isSending}
            rows={1}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || isSending}
            className="h-11 w-11 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors shadow-sm shrink-0"
          >
            {isSending ? (
               <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
            )}
          </button>
        </form>
      </footer>

    </div>
  );
}