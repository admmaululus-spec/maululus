"use client";

import { useState, useEffect, use } from "react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/app/lib/supabase"; // Import instance supabase yang sudah kamu buat
export const runtime = 'edge';

export default function ChatTimeline({ params }: { params: Promise<{ id: string }> }) {
  // Gunakan 'use' untuk unwrap Promise params di Next.js App Router terbaru
  const unwrappedParams = use(params);
  const consultationId = unwrappedParams.id;

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

 

  // Ambil ID User dan Pesan awal saat komponen dimuat
  useEffect(() => {
    const initializeChat = async () => {
      // 1. Ambil session user yang sedang login
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      } else {
        // Jika tidak ada user yang login, arahkan atau beri peringatan
        console.warn("User belum login");
        // router.push('/auth'); // Opsional: import useRouter dari next/navigation
      }

      // 2. Fetch pesan awal dari tabel messages
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("consultation_id", consultationId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };

    initializeChat();

    // 3. Subscribe ke realtime updates menggunakan instance Supabase
    const channel = supabase
      .channel("realtime-messages")
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `consultation_id=eq.${consultationId}` 
        }, 
        (payload: any) => { // Perbaikan: Tambahkan tipe any pada payload
          setMessages((current) => [...current, payload.new]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [consultationId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setIsUploading(true);
    let fileToUpload = file;

    // Kompresi jika file adalah gambar
    if (file.type.startsWith("image/")) {
      const options = {
        maxSizeMB: 1, 
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        fileToUpload = await imageCompression(file, options);
      } catch (error) {
        console.error("Gagal kompresi", error);
      }
    }

    // Upload ke Supabase Storage (Pastikan bucket 'chat_attachments' sudah dibuat)
    const fileName = `${Date.now()}-${fileToUpload.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("chat_attachments")
      .upload(`public/${fileName}`, fileToUpload);

    if (!uploadError && uploadData) {
      const { data: { publicUrl } } = supabase.storage
        .from("chat_attachments")
        .getPublicUrl(uploadData.path);
      
      // Simpan referensi file ke tabel messages
      await supabase.from("messages").insert([{
        consultation_id: consultationId,
        sender_id: userId,
        file_url: publicUrl,
        file_type: fileToUpload.type,
      }]);
    } else {
        console.error("Gagal upload file:", uploadError);
    }
    setIsUploading(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;
    
    const msg = input;
    setInput(""); 

    await supabase.from("messages").insert([{
      consultation_id: consultationId,
      sender_id: userId,
      content: msg
    }]);
  };

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col bg-brand-light p-4">
      {/* Area Chat Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => {
            const isMe = msg.sender_id === userId;
            return (
                <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] p-4 rounded-xl shadow-sm ${isMe ? "bg-brand-emerald text-white rounded-tr-none" : "bg-white text-brand-navy rounded-tl-none border-l-4 border-brand-navy"}`}>
                    {msg.content && <p>{msg.content}</p>}
                    {msg.file_url && (
                        msg.file_type?.startsWith("image/") 
                        ? <img src={msg.file_url} alt="attachment" className="mt-2 rounded max-w-full h-auto" />
                        : <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="underline mt-2 inline-block">Download Lampiran</a>
                    )}
                    </div>
                </div>
            )
        })}
      </div>

      {/* Area Input Chat */}
      <form onSubmit={sendMessage} className="bg-white p-4 rounded-xl shadow-md flex gap-4 items-center">
        <label className="cursor-pointer text-brand-navy hover:text-brand-emerald transition-colors">
          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" disabled={isUploading || !userId} />
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
        </label>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isUploading ? "Mengunggah..." : "Tulis pesan ke analis..."} 
          className="flex-1 bg-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-emerald disabled:opacity-50"
          disabled={isUploading || !userId}
        />
        <button type="submit" disabled={isUploading || !userId} className="bg-brand-navy text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50">
            Kirim
        </button>
      </form>
    </div>
  );
}