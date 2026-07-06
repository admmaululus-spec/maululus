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

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Teks tidak boleh kosong' }, { status: 400 });
    }

    const safeText = String(text).substring(0, 5000); // Max ~5000 karakter

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: { temperature: 0.4 }
    });

    const promptText = `
      Kamu adalah akademisi dan editor jurnal ahli. Tugasmu adalah mem-parafrase teks berikut agar lolos uji plagiarisme (Turnitin) namun tetap mempertahankan makna aslinya secara utuh. 
      
      Aturan:
      1. Gunakan bahasa Indonesia akademis yang baku, formal, dan natural.
      2. Jangan menambahkan opini pribadi atau informasi di luar teks asli.
      3. Langsung berikan hasil parafrasenya saja, tanpa salam pengantar atau penutup.

      Teks Asli:
      "${safeText}"
    `;

    const result = await model.generateContent(promptText);
    return NextResponse.json({ result: result.response.text().trim() });

  } catch (error: any) {
    console.error('Error proses parafrase:', error);
    return NextResponse.json({ error: `Gagal memproses AI: ${error.message}` }, { status: 500 });
  }
}