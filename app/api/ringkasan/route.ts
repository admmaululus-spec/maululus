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
      return NextResponse.json({ error: 'Teks jurnal tidak boleh kosong' }, { status: 400 });
    }
    
    // Batasi input (Misal 10.000 karakter, karena jurnal biasanya lumayan panjang)
    const safeText = String(text).substring(0, 10000);

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: { temperature: 0.3 }
    });

    const promptText = `
      Kamu adalah asisten peneliti ahli. Tolong baca teks/abstrak jurnal berikut dan buatkan ringkasannya dalam bahasa Indonesia yang baku.
      
      Format ringkasan harus seperti ini (Gunakan bullet points agar mudah dibaca):
      - 🎯 Tujuan Penelitian: ...
      - ⚙️ Metodologi: ...
      - 📊 Hasil Temuan: ...
      - 💡 Kesimpulan: ...

      Teks Jurnal Asli:
      "${safeText}"
    `;

    const result = await model.generateContent(promptText);
    return NextResponse.json({ result: result.response.text().trim() });

  } catch (error: any) {
    console.error('Error proses ringkasan:', error);
    return NextResponse.json({ error: `Gagal memproses AI: ${error.message}` }, { status: 500 });
  }
}