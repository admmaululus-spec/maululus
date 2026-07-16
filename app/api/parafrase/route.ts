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
    const { text } = await req.json();

    if (!text) return NextResponse.json({ error: 'Teks tidak boleh kosong' }, { status: 400 });

    const { data: pricingData } = await supabase.from('ai_tools_pricing').select('koin').eq('id', 'parafrase').single();
    const HARGA_KOIN = pricingData?.koin !== undefined ? pricingData.koin : 15;

    // PERBAIKAN: Gunakan users_data
    const { data: profile } = await supabase.from('users_data').select('koin').eq('id', userId).single();
    const currentKoin = profile?.koin || 0;

    if (currentKoin < HARGA_KOIN) return NextResponse.json({ error: `Koin tidak cukup! Butuh ${HARGA_KOIN} Koin.` }, { status: 402 });

    if (HARGA_KOIN > 0) {
      const { error: deductError } = await supabase.from('users_data').update({ koin: currentKoin - HARGA_KOIN }).eq('id', userId);
      if (deductError) throw new Error("Gagal memotong koin");
    }

    await supabase.from('ai_tools_history').insert({ user_id: userId, tool_name: 'Parafrase', input_data: `Teks (${String(text).length} karakter)` });

    const safeText = String(text).substring(0, 5000);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { temperature: 0.4 } });
    const promptText = `Kamu adalah akademisi dan editor jurnal ahli. Tugasmu adalah mem-parafrase teks berikut agar lolos uji plagiarisme (Turnitin) namun tetap mempertahankan makna aslinya secara utuh. 
      Aturan:
      1. Gunakan bahasa Indonesia akademis yang baku, formal, dan natural.
      2. Jangan menambahkan opini pribadi atau informasi di luar teks asli.
      3. Langsung berikan hasil parafrasenya saja, tanpa salam pengantar atau penutup.

      Teks Asli:
      "${safeText}"`;

    const result = await model.generateContent(promptText);
    return NextResponse.json({ result: result.response.text().trim(), sisa_koin: currentKoin - HARGA_KOIN });

  } catch (error: any) {
    return NextResponse.json({ error: `Gagal memproses AI: ${error.message}` }, { status: 500 });
  }
}