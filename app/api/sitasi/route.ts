import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'edge';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const { input_data, format_style = "APA" } = await req.json();

    if (!input_data) return NextResponse.json({ error: 'Data/Judul jurnal tidak boleh kosong' }, { status: 400 });

    const { data: pricingData } = await supabase.from('ai_tools_pricing').select('koin').eq('id', 'sitasi').single();
    const HARGA_KOIN = pricingData?.koin !== undefined ? pricingData.koin : 5;

    // PERBAIKAN: Gunakan users_data
    const { data: profile } = await supabase.from('users_data').select('koin').eq('id', userId).single();
    const currentKoin = profile?.koin || 0;

    if (currentKoin < HARGA_KOIN) return NextResponse.json({ error: `Koin tidak cukup! Butuh ${HARGA_KOIN} Koin.` }, { status: 402 });

    if (HARGA_KOIN > 0) {
      const { error: deductError } = await supabase.from('users_data').update({ koin: currentKoin - HARGA_KOIN }).eq('id', userId);
      if (deductError) throw new Error("Gagal memotong koin");
    }

    await supabase.from('ai_tools_history').insert({ user_id: userId, tool_name: 'Generate Sitasi', input_data: `Format: ${format_style}` });

    const safeInput = String(input_data).substring(0, 2000);
    const safeFormat = String(format_style).substring(0, 50);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

    const prompt = `Kamu adalah asisten akademik ahli. Pengguna memberikan data mentah, judul, atau kutipan jurnal berikut:
      "${safeInput}"
      Tugasmu:
      1. Ekstrak atau tebak informasi metadata (Penulis, Tahun, Judul, Jurnal/Penerbit).
      2. Buatkan sitasi (kutipan dalam teks / in-text citation).
      3. Buatkan Daftar Pustaka lengkap dengan format ${safeFormat} (misal: APA 7th Edition, Harvard, atau MLA).
      4. Format hasilnya dalam format JSON dengan struktur berikut:
      {
        "in_text_citation": "(Penulis, Tahun)",
        "bibliography": "Penulis. (Tahun). Judul. Jurnal...",
        "style_used": "${safeFormat}"
      }
      Hanya kembalikan JSON, tanpa teks markdown lainnya (tanpa \`\`\`json).`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const sitasiData = JSON.parse(responseText);
      return NextResponse.json({ result: sitasiData, sisa_koin: currentKoin - HARGA_KOIN });
    } catch (e) {
      return NextResponse.json({ error: 'Format balasan AI tidak sesuai standar JSON' }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: `Gagal menyusun sitasi: ${error.message}` }, { status: 500 });
  }
}