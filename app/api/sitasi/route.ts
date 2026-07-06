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

    const { input_data, format_style = "APA" } = await req.json();

    if (!input_data) {
      return NextResponse.json({ error: 'Data/Judul jurnal tidak boleh kosong' }, { status: 400 });
    }

    const safeInput = String(input_data).substring(0, 2000);
    const safeFormat = String(format_style).substring(0, 50);

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    const prompt = `
      Kamu adalah asisten akademik ahli. Pengguna memberikan data mentah, judul, atau kutipan jurnal berikut:
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

      Hanya kembalikan JSON, tanpa teks markdown lainnya (tanpa \`\`\`json).
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const sitasiData = JSON.parse(responseText);
      return NextResponse.json({ result: sitasiData });
    } catch (e) {
      return NextResponse.json({ error: 'Format balasan AI tidak sesuai standar JSON' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error generate sitasi:', error);
    return NextResponse.json({ error: `Gagal menyusun sitasi: ${error.message}` }, { status: 500 });
  }
}