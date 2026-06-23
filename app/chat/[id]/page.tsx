'use client';
export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

type Message = { id: string; sender_id: string; message: string; created_at: string; file_url?: string; file_name?: string; file_type?: string; is_read?: boolean; };
type SessionDetail = { id: string; stage: string; analyst_id: string; analyst_profiles: { name: string; photo_url: string; expertise?: string; }; };

const Toast = ({ msg, type, onClose }: { msg: string, type: 'success' | 'error' | 'info', onClose: () => void }) => (
  <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border ${type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
      <span className="text-sm font-bold">{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100">✕</button>
    </div>
  </div>
);

// Filter Nomor Telepon
const containsPhoneNumber = (text: string) => {
  const normalized = text.toLowerCase()
    .replace(/\s|-|\.|\+|,/g, '')
    .replace(/o/g, '0').replace(/i/g, '1').replace(/l/g, '1').replace(/z/g, '2')
    .replace(/e/g, '3').replace(/a/g, '4').replace(/s/g, '5').replace(/g/g, '6')
    .replace(/t/g, '7').replace(/b/g, '8').replace(/p/g, '9');
  return /(08|628)\d{7,12}/.test(normalized);
};

export default function UserChatRoom() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  // STATE UNTUK FITUR PILIH SKRIPSI
  const [savedSkripsi, setSavedSkripsi] = useState<any[]>([]);
  const [showSkripsiModal, setShowSkripsiModal] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string, type: 'success'|'error' = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    let channel: any;
    const initChat = async () => {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) return router.replace('/auth');
      setCurrentUserId(authSession.user.id);

      const { data: sessionData, error: sessionError } = await supabase.from('chat_sessions').select(`id, stage, analyst_id, analyst_profiles(name, photo_url, expertise)`).eq('id', sessionId).single();
      if (sessionError || !sessionData) {
        showToast('Sesi chat tidak valid.', 'error');
        return router.replace('/dashboard');
      }
      setSessionDetail(sessionData as any);

      const { data: messagesData } = await supabase.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
      if (messagesData) {
        setMessages(messagesData);
        // Tandai sudah dibaca
        const unreadIds = messagesData.filter(m => m.sender_id !== authSession.user.id && !m.is_read).map(m => m.id);
        if (unreadIds.length > 0) supabase.from('chat_messages').update({ is_read: true }).in('id', unreadIds).then();
      }
      setIsLoading(false);

      channel = supabase.channel(`chat_room_${sessionId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sessionId}` }, (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
            if (newMsg.sender_id !== authSession.user.id) supabase.from('chat_messages').update({ is_read: true }).eq('id', newMsg.id).then();
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sessionId}` }, (payload) => {
            const updatedMsg = payload.new as Message;
            setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
        }).subscribe();
    };

    if (sessionId) initChat();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [sessionId, router]);

  // --- FUNGSI MENGAMBIL DATA SKRIPSI ---
  const fetchSavedSkripsi = async () => {
    if (!currentUserId) return;
    const { data } = await supabase.from('history_skripsi').select('*').eq('user_id', currentUserId).order('created_at', { ascending: false });
    if (data) setSavedSkripsi(data);
    setShowSkripsiModal(true);
  };

  // --- FUNGSI MENGIRIM KONTEKS SKRIPSI KE CHAT ---
  const sendSkripsiContext = async (skripsi: any) => {
    setShowSkripsiModal(false);
    const contextMsg = `📌 TOPIK SKRIPSI YANG DIPILIH:\n\nJudul: ${skripsi.judul}\nJurusan: ${skripsi.jurusan || '-'}\n\nMohon bantuannya untuk dokumen ini.`;
    
    const { data: insertedMsg, error } = await supabase.from('chat_messages').insert([{
      session_id: sessionId, sender_id: currentUserId, message: contextMsg,
    }]).select().single();

    if (error) showToast('Gagal mengirim konteks skripsi.', 'error');
    else if (insertedMsg) setMessages(prev => prev.some(m => m.id === insertedMsg.id) ? prev : [...prev, insertedMsg]);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUserId) return;
    if (file.size > 5 * 1024 * 1024) return showToast('Ukuran file maksimal 5MB', 'error');

    setIsUploading(true);
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const fileType = file.type.startsWith('image/') ? 'image' : 'document';

    try {
      const { error: uploadError } = await supabase.storage.from('chat_attachments').upload(`${sessionId}/${fileName}`, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('chat_attachments').getPublicUrl(`${sessionId}/${fileName}`);
      
      const { data: insertedMsg, error: dbError } = await supabase.from('chat_messages').insert([{
        session_id: sessionId, sender_id: currentUserId,
        message: fileType === 'image' ? '📷 Mengirim gambar' : `📄 Mengirim dokumen: ${file.name}`,
        file_url: publicUrlData.publicUrl, file_name: file.name, file_type: fileType
      }]).select().single();

      if (dbError) throw dbError;
      if (insertedMsg) setMessages(prev => prev.some(m => m.id === insertedMsg.id) ? prev : [...prev, insertedMsg]);
    } catch (err: any) {
      showToast('Gagal upload lampiran. Coba lagi.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    if (containsPhoneNumber(newMessage)) {
      showToast('Pesan diblokir: Dilarang mengirim nomor WhatsApp atau kontak pribadi.', 'error');
      return;
    }

    setIsSending(true);
    let textToSend = newMessage.trim();
    
    if (replyingTo) {
      const snippet = replyingTo.message.substring(0, 30).replace(/\n/g, ' ');
      textToSend = `> Membalas: "${snippet}..."\n\n${textToSend}`;
    }

    setNewMessage('');
    setReplyingTo(null);

    const { data: insertedMsg, error } = await supabase.from('chat_messages').insert([{
      session_id: sessionId, sender_id: currentUserId, message: textToSend,
    }]).select().single();

    if (error) {
      showToast('Gagal mengirim pesan', 'error');
      setNewMessage(textToSend);
    } else if (insertedMsg) {
      setMessages(prev => prev.some(m => m.id === insertedMsg.id) ? prev : [...prev, insertedMsg]);
    }
    setIsSending(false);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div></div>;

  return (
    <div className="flex flex-col h-screen bg-[#F4F5F7] max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* MODAL PILIH SKRIPSI */}
      {showSkripsiModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-500"><path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zM12.75 12a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0V12zM7.5 10.5a.75.75 0 000 1.5h.008a.75.75 0 000-1.5H7.5zm0 3a.75.75 0 000 1.5h.008a.75.75 0 000-1.5H7.5zm0 3a.75.75 0 000 1.5h.008a.75.75 0 000-1.5H7.5z" clipRule="evenodd" /></svg>
                Pilih Dokumen Skripsi
              </h3>
              <button onClick={() => setShowSkripsiModal(false)} className="h-8 w-8 bg-slate-200 hover:bg-red-100 hover:text-red-600 rounded-full flex items-center justify-center text-slate-500 transition-colors font-bold">✕</button>
            </div>
            <div className="overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
               {savedSkripsi.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-sm text-slate-500 font-medium">Belum ada dokumen yang disimpan.</p>
                    <Link href="/generator" className="text-emerald-600 font-bold text-xs mt-2 inline-block hover:underline">Buat Skripsi Sekarang &rarr;</Link>
                  </div>
               ) : (
                  savedSkripsi.map(item => (
                    <div key={item.id} onClick={() => sendSkripsiContext(item)} className="p-4 border-2 border-slate-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer transition-all group">
                       <h4 className="font-bold text-sm text-slate-800 mb-1 group-hover:text-emerald-700 line-clamp-2">{item.judul}</h4>
                       <p className="text-xs text-slate-500 font-semibold">{item.jurusan || 'Tanpa Jurusan'}</p>
                       <p className="text-[10px] text-slate-400 mt-2">Dibuat: {new Date(item.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                    </div>
                  ))
               )}
            </div>
          </div>
        </div>
      )}

      <header className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </Link>
          <img src={sessionDetail?.analyst_profiles?.photo_url || 'https://via.placeholder.com/40'} alt="Analis" className="w-10 h-10 rounded-full object-cover border border-slate-200"/>
          <div>
            <h1 className="font-bold text-slate-800 text-sm">{sessionDetail?.analyst_profiles?.name}</h1>
            <p className="text-[10px] font-semibold text-emerald-600">Pakar {sessionDetail?.analyst_profiles?.expertise}</p>
          </div>
        </div>
        
        {/* TOMBOL PILIH SKRIPSI DI HEADER */}
        <button 
          onClick={fetchSavedSkripsi} 
          className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zM12.75 12a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0V12zM7.5 10.5a.75.75 0 000 1.5h.008a.75.75 0 000-1.5H7.5zm0 3a.75.75 0 000 1.5h.008a.75.75 0 000-1.5H7.5zm0 3a.75.75 0 000 1.5h.008a.75.75 0 000-1.5H7.5z" clipRule="evenodd" /></svg>
          <span className="hidden sm:inline">Pilih Skripsi</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/50">
        
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

          // RENDER KOTAK BIRU (PINNED SKRIPSI)
          if (isPinned) {
            return (
              <div key={msg.id} className="flex justify-center my-4 px-2 w-full">
                <div className="bg-[#0D1C2E] border border-blue-900 text-white px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-lg w-full max-w-[90%] text-left">
                  <div className="font-bold mb-3 flex items-center gap-2 text-amber-400 text-xs tracking-widest uppercase">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>
                    Konteks Skripsi Terpilih
                  </div>
                  <div className="text-slate-200">
                    {displayMsg.replace('📌 TOPIK SKRIPSI YANG DIPILIH:\n\n', '').split('\n').map((l, i) => <span key={i}>{l}<br/></span>)}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}>
              
              <button onClick={() => setReplyingTo(msg)} className={`absolute top-2 ${isMe ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-emerald-600 transition-opacity bg-white rounded-full shadow-sm`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
              </button>

              <div className={`max-w-[85%] sm:max-w-[75%] shadow-sm flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {isReply && (
                  <div className={`mb-1 px-3 py-1.5 rounded-lg text-[10px] italic border-l-2 ${isMe ? 'bg-emerald-600 border-emerald-200 text-emerald-100' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
                    Membalas: {replySnippet}
                  </div>
                )}

                <div className={`px-4 py-2.5 text-sm leading-relaxed ${isMe ? 'bg-emerald-500 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'}`}>
                  {msg.file_url && msg.file_type === 'image' && <a href={msg.file_url} target="_blank" rel="noopener noreferrer"><img src={msg.file_url} alt="Attachment" className="max-h-60 w-auto rounded-xl object-cover mb-2" /></a>}
                  {msg.file_url && msg.file_type === 'document' && (
                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-colors ${isMe ? 'bg-emerald-600' : 'bg-slate-50 border border-slate-200'}`}>
                      <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-white/20"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg></div>
                      <div className="overflow-hidden"><p className="text-xs font-bold truncate max-w-[150px]">{msg.file_name}</p></div>
                    </a>
                  )}
                  {(!msg.file_url || msg.message !== `📄 Mengirim dokumen: ${msg.file_name}` && msg.message !== '📷 Mengirim gambar') && displayMsg.split('\n').map((l, i) => <span key={i}>{l}<br/></span>)}
                </div>
              </div>

              <div className="flex items-center gap-1 mt-1 px-1">
                <span className="text-[9px] font-semibold text-slate-400 opacity-70 group-hover:opacity-100 transition-opacity">
                  {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMe && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 ${msg.is_read ? 'text-blue-500' : 'text-slate-300'}`}>
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.815a.75.75 0 011.05-.145z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-1" />
      </main>

      <footer className="bg-white border-t border-slate-200 shrink-0 pb-safe z-10 flex flex-col">
        {replyingTo && (
          <div className="bg-emerald-50 px-4 py-2 border-l-4 border-emerald-500 flex justify-between items-center text-xs text-emerald-800">
            <span className="truncate pr-4">Membalas: {replyingTo.message.substring(0,40)}...</span>
            <button onClick={() => setReplyingTo(null)} className="font-bold p-1 hover:bg-emerald-200 rounded-full">✕</button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-end gap-2 p-3 sm:p-4">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="h-11 w-11 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full flex items-center justify-center transition-colors shrink-0 disabled:opacity-50">
            {isUploading ? <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full"></div> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>}
          </button>
          
          <textarea
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder="Ketik pesan..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none min-h-[44px] max-h-32 custom-scrollbar"
            disabled={isSending} rows={1}
          />
          <button type="submit" disabled={!newMessage.trim() || isSending} className="h-11 w-11 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors shadow-sm shrink-0">
            {isSending ? <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>}
          </button>
        </form>
      </footer>
    </div>
  );
}