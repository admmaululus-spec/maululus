'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';

type ChatSession = {
  id: string;
  user_id: string;
  user_name: string;
  stage: string;
  created_at: string;
};

type Message = {
  id: string;
  session_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  is_read?: boolean;
};

// --- KOMPONEN CUSTOM TOAST ---
const Toast = ({ msg, type, onClose }: { msg: string, type: 'success' | 'error' | 'info', onClose: () => void }) => (
  <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border ${type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
      <span className="text-sm font-bold">{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">✕</button>
    </div>
  </div>
);

// 🛡️ FUNGSI FILTER NOMOR TELEPON (ANTI BYPASS) 🛡️
const containsPhoneNumber = (text: string) => {
  const normalized = text.toLowerCase()
    .replace(/\s|-|\.|\+|,/g, '')
    .replace(/o/g, '0').replace(/i/g, '1').replace(/l/g, '1').replace(/z/g, '2')
    .replace(/e/g, '3').replace(/a/g, '4').replace(/s/g, '5').replace(/g/g, '6')
    .replace(/t/g, '7').replace(/b/g, '8').replace(/p/g, '9');
  return /(08|628)\d{7,12}/.test(normalized);
};

export default function AnalystChatManagement() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [rooms, setRooms] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string, type: 'success'|'error' = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // 1. Ambil Daftar Sesi Chat
  useEffect(() => {
    const fetchRooms = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setCurrentUserId(session.user.id);

      const { data: analystProfile } = await supabase.from('analyst_profiles').select('id').eq('user_id', session.user.id).single();
      if (!analystProfile) { setIsLoading(false); return; }

      const { data: sessions } = await supabase.from('chat_sessions').select('*').eq('analyst_id', analystProfile.id).order('created_at', { ascending: false });

      if (sessions && sessions.length > 0) {
        const userIds = [...new Set(sessions.map(s => s.user_id))];
        const { data: usersData } = await supabase.from('users_data').select('id, email').in('id', userIds);

        const formattedRooms = sessions.map(s => {
          const user = usersData?.find(u => u.id === s.user_id);
          return { ...s, user_name: user?.email?.split('@')[0] || 'Mahasiswa' };
        });
        setRooms(formattedRooms);
      }
      setIsLoading(false);
    };
    fetchRooms();
  }, []);

  // 2. Ambil Pesan & Realtime Listener
  useEffect(() => {
    let channel: any;
    const fetchMessages = async () => {
      if (!activeSession || !currentUserId) return;
      
      const { data } = await supabase.from('chat_messages').select('*').eq('session_id', activeSession.id).order('created_at', { ascending: true });
      if (data) {
        setMessages(data);
        // Tandai pesan sebagai dibaca
        const unreadIds = data.filter(m => m.sender_id !== currentUserId && !m.is_read).map(m => m.id);
        if (unreadIds.length > 0) {
          await supabase.from('chat_messages').update({ is_read: true }).in('id', unreadIds);
        }
      }

      channel = supabase.channel(`chat_room_${activeSession.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${activeSession.id}` }, (payload) => {
             const newMsg = payload.new as Message;
             setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
             // Auto-read
             if (newMsg.sender_id !== currentUserId) supabase.from('chat_messages').update({ is_read: true }).eq('id', newMsg.id).then();
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${activeSession.id}` }, (payload) => {
            const updatedMsg = payload.new as Message;
            setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
        }).subscribe();
    };

    fetchMessages();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [activeSession, currentUserId]);

  // --- FITUR UPLOAD LAMPIRAN ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUserId || !activeSession) return;
    if (file.size > 5 * 1024 * 1024) return showToast('Ukuran file maksimal 5MB', 'error');

    setIsUploading(true);
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const fileType = file.type.startsWith('image/') ? 'image' : 'document';

    try {
      const { error: uploadError } = await supabase.storage.from('chat_attachments').upload(`${activeSession.id}/${fileName}`, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('chat_attachments').getPublicUrl(`${activeSession.id}/${fileName}`);
      
      const { data: insertedMsg, error: dbError } = await supabase.from('chat_messages').insert([{
        session_id: activeSession.id, sender_id: currentUserId,
        message: fileType === 'image' ? '📷 Mengirim gambar' : `📄 Mengirim dokumen: ${file.name}`,
        file_url: publicUrlData.publicUrl, file_name: file.name, file_type: fileType
      }]).select().single();

      if (dbError) throw dbError;
      if (insertedMsg) setMessages(prev => prev.some(m => m.id === insertedMsg.id) ? prev : [...prev, insertedMsg]);
    } catch (err) {
      showToast('Gagal upload lampiran.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeSession || !currentUserId) return;

    if (containsPhoneNumber(inputText)) {
      showToast('Pesan diblokir: Dilarang mengirim nomor WhatsApp atau kontak pribadi di luar sistem.', 'error');
      return;
    }

    let textToSend = inputText.trim();
    
    // FORMAT REPLY
    if (replyingTo) {
      const snippet = replyingTo.message.substring(0, 30).replace(/\n/g, ' ');
      textToSend = `> Membalas: "${snippet}..."\n\n${textToSend}`;
    }

    setInputText('');
    setReplyingTo(null);

    const { data: insertedMsg, error } = await supabase.from('chat_messages').insert({
       session_id: activeSession.id, sender_id: currentUserId, message: textToSend
    }).select().single();

    if (error) {
      showToast("Gagal mengirim pesan.", "error");
      setInputText(textToSend);
    } else if (insertedMsg) {
      setMessages(prev => prev.some(m => m.id === insertedMsg.id) ? prev : [...prev, insertedMsg]);
    }
  };

  const handleLihatSkripsi = async () => {
    if (!activeSession) return;
    const { data } = await supabase.from('history_skripsi').select('judul, created_at').eq('user_id', activeSession.user_id).order('created_at', { ascending: false }).limit(1).single();
    if (data) alert(`Judul: ${data.judul}\nDibuat: ${new Date(data.created_at).toLocaleDateString('id-ID')}`);
    else showToast('Klien ini belum menyimpan dokumen.', 'error');
  };

  if (isLoading) return <div className="h-full flex items-center justify-center bg-white"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div></div>;

  return (
    <div className="flex h-full w-full bg-white divide-x divide-slate-200 relative">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* SIDEBAR */}
      <div className={`${activeSession ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 h-full bg-slate-50/50 shrink-0`}>
        <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Pesan Masuk</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">{rooms.length} Sesi Aktif</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {rooms.map(room => (
            <div key={room.id} onClick={() => setActiveSession(room)} className={`p-3 rounded-xl cursor-pointer transition-all flex gap-3 items-center border ${activeSession?.id === room.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-100'}`}>
              <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-slate-600 font-bold">{room.user_name.charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800 truncate">{room.user_name}</h3>
                <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mt-0.5">Tahap: {room.stage}</p>
              </div>
            </div>
          ))}
          {rooms.length === 0 && <div className="text-center py-10 text-slate-400 text-sm font-medium">Belum ada chat masuk.</div>}
        </div>
      </div>

      {/* RUANG OBROLAN */}
      {activeSession ? (
        <div className="flex-1 flex flex-col h-full bg-[#FAFAFC] relative min-w-0">
          
          <div className="h-16 px-4 md:px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveSession(null)} className="md:hidden text-slate-500 p-2 -ml-2 rounded-lg hover:bg-slate-100"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">{activeSession.user_name.charAt(0).toUpperCase()}</div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 leading-none mb-1">{activeSession.user_name}</h2>
                <span className="text-[10px] font-semibold text-emerald-600 inline-flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Klien Aktif</span>
              </div>
            </div>
            <button onClick={handleLihatSkripsi} className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors">Lihat Skripsi</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/50">
            <div className="flex justify-center mb-2">
              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg">Sesi Terhubung secara Real-Time</span>
            </div>
            {messages.map((msg) => {
              const isPinned = msg.message.startsWith('📌');
              const isReply = msg.message.startsWith('> Membalas:');
              const isMe = msg.sender_id === currentUserId;
              
              let displayMsg = msg.message;
              let replySnippet = '';
              if (isReply) {
                const parts = msg.message.split('\n\n');
                replySnippet = parts[0].replace('> Membalas: ', '');
                displayMsg = parts.slice(1).join('\n\n');
              }

              if (isPinned) {
                return (
                  <div key={msg.id} className="flex justify-center my-4 px-2 w-full">
                    <div className="bg-[#0D1C2E] border border-blue-900 text-white px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-lg w-full max-w-[90%] md:max-w-xl text-left">
                      <div className="font-bold mb-2 flex items-center gap-2 text-amber-400 text-xs tracking-widest uppercase">📌 Konteks Skripsi</div>
                      <div className="text-slate-200">{displayMsg.replace('📌 TOPIK SKRIPSI YANG DIPILIH:\n\n', '').replace('📌 KONTEKS KONSULTASI UMUM:\n', '').split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}>
                  
                  {/* TOMBOL REPLY DI SEBELAH PESAN SAAT HOVER */}
                  <button onClick={() => setReplyingTo(msg)} className={`absolute top-2 ${isMe ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-opacity bg-white rounded-full shadow-sm`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                  </button>

                  <div className={`max-w-[85%] md:max-w-[70%] shadow-sm flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    
                    {/* BLOK REPLY */}
                    {isReply && (
                      <div className={`mb-1 px-3 py-1.5 rounded-lg text-[10px] italic border-l-2 ${isMe ? 'bg-blue-700 border-blue-300 text-blue-100' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
                        Membalas: {replySnippet}
                      </div>
                    )}

                    <div className={`px-4 py-2.5 text-sm leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'}`}>
                      {/* LAMPIRAN */}
                      {msg.file_url && msg.file_type === 'image' && <a href={msg.file_url} target="_blank" rel="noopener noreferrer"><img src={msg.file_url} alt="Attachment" className="max-h-60 w-auto rounded-xl object-cover mb-2" /></a>}
                      {msg.file_url && msg.file_type === 'document' && (
                        <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-colors ${isMe ? 'bg-blue-700' : 'bg-slate-50 border border-slate-200'}`}>
                          <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-white/20"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg></div>
                          <div className="overflow-hidden"><p className="text-xs font-bold truncate max-w-[150px]">{msg.file_name}</p></div>
                        </a>
                      )}
                      {/* TEKS PESAN */}
                      {(!msg.file_url || msg.message !== `📄 Mengirim dokumen: ${msg.file_name}` && msg.message !== '📷 Mengirim gambar') && displayMsg.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-1 px-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-semibold text-slate-400">{new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 ${msg.is_read ? 'text-blue-500' : 'text-slate-300'}`}><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.815a.75.75 0 011.05-.145z" clipRule="evenodd" /></svg>}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          <div className="p-3 md:p-4 bg-white border-t border-slate-200 shrink-0 pb-safe flex flex-col">
            
            {/* PREVIEW REPLY BOX */}
            {replyingTo && (
              <div className="bg-blue-50 px-4 py-2 border-l-4 border-blue-500 flex justify-between items-center text-xs text-blue-800">
                <span className="truncate pr-4">Membalas: {replyingTo.message.substring(0,40)}...</span>
                <button onClick={() => setReplyingTo(null)} className="font-bold p-1 hover:bg-blue-200 rounded-full">✕</button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto w-full mt-2">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="h-11 w-11 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full flex items-center justify-center transition-colors shrink-0 disabled:opacity-50">
                {isUploading ? <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent animate-spin rounded-full"></div> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>}
              </button>

              <textarea 
                value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Balas pesan klien..." 
                className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none min-h-[44px] max-h-32 custom-scrollbar transition-all"
                rows={1}
              />
              <button type="submit" disabled={!inputText.trim() || isUploading} className="h-11 w-11 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 shrink-0 shadow-sm">
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