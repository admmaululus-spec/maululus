'use client';
export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

type Message = { id: string; sender_id: string; message: string; created_at: string; };
type SessionDetail = { id: string; stage: string; analyst_id: string; analyst_profiles: { name: string; photo_url: string; expertise?: string; }; };
type SkripsiHistory = { id: string; judul: string; created_at: string; };

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

  // States untuk Popup Pilih Skripsi
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [userHistory, setUserHistory] = useState<SkripsiHistory[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let channel: any;

    const initChat = async () => {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) return router.replace('/auth');
      setCurrentUserId(authSession.user.id);

      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select(`id, stage, analyst_id, analyst_profiles ( name, photo_url, expertise )`)
        .eq('id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        alert('Sesi chat tidak valid.');
        return router.replace('/dashboard');
      }
      
      // @ts-ignore
      setSessionDetail(sessionData);

      const { data: messagesData } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (messagesData) {
        setMessages(messagesData);
        // LOGIKA POPUP: Jika belum ada chat sama sekali, paksa user pilih skripsi
        if (messagesData.length === 0) {
          setShowTopicPicker(true);
          const { data: hist } = await supabase.from('history_skripsi').select('id, judul, created_at').eq('user_id', authSession.user.id).order('created_at', { ascending: false });
          if (hist) setUserHistory(hist);
        }
      }
      setIsLoading(false);

      channel = supabase.channel(`chat_room_${sessionId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sessionId}` },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => {
              if (prev.some((msg) => msg.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        ).subscribe();
    };

    if (sessionId) initChat();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [sessionId, router]);

  // Fungsi Mensubmit Konteks Topik (Pesan Pinned Pertama)
  const handleStartWithTopic = async (useTopic: boolean) => {
    if (!currentUserId) return;
    setIsSubmittingTopic(true);

    let firstMessageText = "📌 KONTEKS KONSULTASI UMUM:\nMahasiswa memulai sesi tanpa memilih hasil generate skripsi.";

    if (useTopic && selectedTopics.length > 0) {
      const selectedTitles = userHistory.filter(h => selectedTopics.includes(h.id)).map(h => h.judul);
      firstMessageText = `📌 TOPIK SKRIPSI YANG DIPILIH:\n\n` + selectedTitles.map((t, i) => `${i+1}. ${t}`).join('\n\n');
    }

    const { data: insertedMsg, error } = await supabase.from('chat_messages').insert([{
      session_id: sessionId,
      sender_id: currentUserId,
      message: firstMessageText,
    }]).select().single();

    if (!error && insertedMsg) {
      setShowTopicPicker(false);
      setMessages([insertedMsg]);
    } else {
      alert("Gagal memulai sesi. Periksa koneksi Anda.");
    }
    setIsSubmittingTopic(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    setIsSending(true);
    const textToSend = newMessage.trim();
    setNewMessage('');

    const { data: insertedMsg, error } = await supabase.from('chat_messages').insert([{
      session_id: sessionId,
      sender_id: currentUserId,
      message: textToSend,
    }]).select().single();

    if (error) {
      alert('Gagal mengirim pesan');
      setNewMessage(textToSend);
    } else if (insertedMsg) {
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === insertedMsg.id)) return prev;
        return [...prev, insertedMsg];
      });
    }
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div></div>;

  return (
    <div className="flex flex-col h-screen bg-[#F4F5F7] max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
      
      <header className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </Link>
          <div className="relative">
            <img src={sessionDetail?.analyst_profiles?.photo_url || 'https://via.placeholder.com/40'} alt="Analis" className="w-10 h-10 rounded-full object-cover border border-slate-200"/>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm leading-tight">{sessionDetail?.analyst_profiles?.name || 'Pakar Analis'}</h1>
            <p className="text-[10px] font-semibold text-emerald-600 truncate max-w-[150px] sm:max-w-[200px]">{sessionDetail?.analyst_profiles?.expertise || 'Konsultan Akademik'}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Sesi Aktif</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/50 relative">
        <div className="flex justify-center mb-2 mt-2">
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 text-center max-w-xs leading-relaxed">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 shrink-0"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" /></svg>
            Sesi konsultasi dimulai. Pesan dilindungi end-to-end.
          </span>
        </div>

        {messages.map((msg) => {
          const isPinned = msg.message.startsWith('📌');
          const isMe = msg.sender_id === currentUserId;

          // RENDER PINNED MESSAGE KHUSUS
          if (isPinned) {
            return (
              <div key={msg.id} className="flex justify-center my-4 px-2 w-full">
                <div className="bg-[#0D1C2E] border border-blue-900 text-white px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-lg w-full max-w-[90%] text-left">
                  <div className="font-bold mb-2 flex items-center gap-2 text-amber-400 text-xs tracking-widest uppercase">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>
                    Konteks Topik Obrolan
                  </div>
                  <div className="text-slate-200">
                    {msg.message.replace('📌 TOPIK SKRIPSI YANG DIPILIH:\n\n', '').replace('📌 KONTEKS KONSULTASI UMUM:\n', '').split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
                  </div>
                </div>
              </div>
            );
          }

          // RENDER PESAN NORMAL
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
              <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                isMe ? 'bg-emerald-500 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'
              }`}>
                {msg.message.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
              </div>
              <span className={`text-[9px] font-semibold text-slate-400 mt-1 px-1 transition-opacity opacity-70 group-hover:opacity-100`}>
                {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-1" />
      </main>

      <footer className="bg-white p-3 sm:p-4 border-t border-slate-200 shrink-0 pb-safe z-10">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <textarea
            value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ketik pesan... (Shift+Enter untuk baris baru)"
            className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-slate-800 resize-none min-h-[44px] max-h-32 custom-scrollbar"
            disabled={isSending || showTopicPicker} rows={1}
          />
          <button type="submit" disabled={!newMessage.trim() || isSending || showTopicPicker} className="h-11 w-11 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors shadow-sm shrink-0">
            {isSending ? <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>}
          </button>
        </form>
      </footer>

      {/* POPUP OVERLAY UNTUK MEMILIH SKRIPSI DI AWAL CHAT */}
      {showTopicPicker && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 border border-emerald-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Pilih Topik Konsultasi</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">Pilih hasil generate skripsi yang ingin kamu bahas dengan analis agar mereka bisa langsung memahami konteksnya.</p>
            
            <div className="space-y-2 mb-8 max-h-[35vh] overflow-y-auto custom-scrollbar pr-2">
              {userHistory.length > 0 ? userHistory.map((hist) => (
                <label key={hist.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedTopics.includes(hist.id) ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedTopics.includes(hist.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedTopics([...selectedTopics, hist.id]);
                      else setSelectedTopics(selectedTopics.filter(id => id !== hist.id));
                    }}
                    className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${selectedTopics.includes(hist.id) ? 'text-emerald-900' : 'text-slate-700'}`}>{hist.judul}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(hist.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </label>
              )) : (
                <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center">
                  <p className="text-xs font-semibold text-slate-500">Kamu belum pernah membuat/generate dokumen skripsi.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleStartWithTopic(true)}
                disabled={isSubmittingTopic || (userHistory.length > 0 && selectedTopics.length === 0)}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex justify-center items-center gap-2"
              >
                {isSubmittingTopic ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white"></div> : 'Gunakan Pilihan Ini'}
              </button>
              <button 
                onClick={() => handleStartWithTopic(false)}
                disabled={isSubmittingTopic}
                className="w-full py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-bold transition-all"
              >
                Lanjut Tanpa Skripsi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}