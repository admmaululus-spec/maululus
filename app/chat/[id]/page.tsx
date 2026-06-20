'use client';

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
    const initChat = async () => {
      // 1. Dapatkan ID User yang sedang login
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) {
        router.push('/auth');
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
          analyst_profiles ( name, photo_url )
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        alert('Sesi chat tidak ditemukan atau Anda tidak memiliki akses.');
        router.push('/dashboard');
        return;
      }
      // @ts-ignore (Mengabaikan tipe bentrok dari relasi Supabase sementara)
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
      const channel = supabase
        .channel(`chat_${sessionId}`)
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
            // Tambahkan pesan ke UI secara langsung
            setMessages((prev) => [...prev, newMsg]);
          }
        )
        .subscribe();

      // Cleanup subscription saat komponen di-unmount
      return () => {
        supabase.removeChannel(channel);
      };
    };

    if (sessionId) initChat();
  }, [sessionId, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    setIsSending(true);
    const textToSend = newMessage;
    setNewMessage(''); // Kosongkan input lebih awal agar UI terasa responsif

    const { error } = await supabase.from('chat_messages').insert([
      {
        session_id: sessionId,
        sender_id: currentUserId,
        message: textToSend,
      },
    ]);

    if (error) {
      alert('Gagal mengirim pesan');
      setNewMessage(textToSend); // Kembalikan teks jika gagal
    }
    setIsSending(false);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div></div>;

  return (
    <div className="flex flex-col h-screen bg-[#F4F5F7] max-w-4xl mx-auto shadow-2xl relative">
      
      {/* HEADER CHAT */}
      <header className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/analis" className="h-10 w-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </Link>
          <img 
            src={sessionDetail?.analyst_profiles?.photo_url || 'https://via.placeholder.com/40'} 
            alt="Analis" 
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">{sessionDetail?.analyst_profiles?.name}</h1>
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Analis Aktif
            </p>
          </div>
        </div>
        
        {/* Status Stage (Fitur Nomor 5) */}
        <div className="hidden sm:block bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Tahap: {sessionDetail?.stage}</span>
        </div>
      </header>

      {/* AREA PESAN */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        
        {/* Pesan Sistem / Intro */}
        <div className="flex justify-center mb-4">
          <span className="bg-slate-200 text-slate-600 text-xs font-bold px-4 py-1.5 rounded-full">
            Konsultasi dimulai. Koin telah dipotong.
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-5 py-3 text-sm shadow-sm ${
                isMe 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'
              }`}>
                {msg.message}
                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} /> {/* Anchor untuk auto-scroll */}
      </main>

      {/* INPUT FORM BAWAH */}
      <footer className="bg-white p-4 border-t border-slate-200 sticky bottom-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan untuk analis..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all text-slate-800"
            disabled={isSending}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || isSending}
            className="h-12 w-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
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