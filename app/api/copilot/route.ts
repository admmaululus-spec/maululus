import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'edge';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const { text, action, judulSkripsi, namaBab } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Teks tidak boleh kosong' }, { status: 400 });
    }

    // ==========================================
    // 1. CEK HARGA DAN POTONG KOIN
    // ==========================================
    // Asumsi ID di database adalah 'copilot'
    const { data: pricingData } = await supabase.from('ai_tools_pricing').select('koin').eq('id', 'copilot').single();
    const HARGA_KOIN = pricingData?.koin !== undefined ? pricingData.koin : 10; // Fallback ke 10

    const { data: profile } = await supabase.from('profiles').select('koin').eq('id', userId).single();
    const currentKoin = profile?.koin || 0;

    if (currentKoin < HARGA_KOIN) {
      return NextResponse.json({ error: `Koin tidak cukup! Butuh ${HARGA_KOIN} Koin.` }, { status: 402 });
    }

    if (HARGA_KOIN > 0) {
      const { error: deductError } = await supabase.from('profiles').update({ koin: currentKoin - HARGA_KOIN }).eq('id', userId);
      if (deductError) throw new Error("Gagal memotong koin");
    }

    // Catat histori pemakaian
    let actionName = action === 'paraphrase' ? 'Parafrase' : (action === 'expand' ? 'Pengembangan Teks' : 'Koreksi Ejaan');
    await supabase.from('ai_tools_history').insert({
      user_id: userId,
      tool_name: `Copilot - ${actionName}`,
      input_data: `Aksi: ${action}`
    });
    // ==========================================

    // Mencegah eksploitasi token limit (Maks 5000 karakter per request)
    const safeText = String(text).substring(0, 5000);
    const safeJudul = String(judulSkripsi || 'Skripsi').substring(0, 200);
    const safeBab = String(namaBab || 'Bab Umum').substring(0, 100);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    let promptText = '';
    const konteks = `Judul Skripsi: "${safeJudul}". Sedang menulis bagian: "${safeBab}".\n\n`;

    switch (action) {
      case 'paraphrase':
        promptText = `Kamu adalah dosen pembimbing ahli. ${konteks}Lakukan parafrase pada teks berikut agar lebih unik, terhindar dari plagiarisme (Turnitin), namun WAJIB menjaga makna aslinya. Gunakan bahasa Indonesia baku, akademis, dan hindari gaya bahasa robot.\n\nTeks asli:\n"${safeText}"\n\nBalas langsung dengan hasil parafrase tanpa teks pembuka/penutup.`;
        break;
      case 'expand':
        promptText = `Kamu adalah dosen pembimbing ahli. ${konteks}Kembangkan teks atau poin-poin singkat berikut menjadi 1 atau 2 paragraf utuh yang kohesif, sangat mendetail, dan menggunakan gaya bahasa akademis skripsi.\n\nTeks asli:\n"${safeText}"\n\nBalas langsung dengan hasil pengembangan tanpa teks pembuka/penutup.`;
        break;
      case 'formalize':
        promptText = `Kamu adalah editor jurnal ilmiah. ${konteks}Perbaiki tata bahasa, ejaan (PUEBI), dan struktur kalimat pada teks berikut agar menjadi bahasa Indonesia yang sangat baku, profesional, dan pantas untuk masuk ke dalam dokumen skripsi/tesis.\n\nTeks asli:\n"${safeText}"\n\nBalas langsung dengan hasil perbaikan tanpa teks pembuka/penutup.`;
        break;
      default:
        return NextResponse.json({ error: 'Aksi tidak dikenali' }, { status: 400 });
    }

    const result = await model.generateContent(promptText);
    const output = result.response.text().trim();

    return NextResponse.json({ 
      result: output,
      sisa_koin: currentKoin - HARGA_KOIN
    });

  } catch (error: any) {
    console.error('Error Copilot API:', error);
    return NextResponse.json({ error: `Gagal memproses teks: ${error.message}` }, { status: 500 });
  }
}