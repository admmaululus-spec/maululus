import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Teks jurnal tidak boleh kosong' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite', // Sangat efisien untuk meringkas teks
      generationConfig: {
        temperature: 0.3, // Rendah agar tidak melenceng dari konteks asli
      }
    });

    const promptText = `
      Kamu adalah asisten peneliti ahli. Tolong baca teks/abstrak jurnal berikut dan buatkan ringkasannya dalam bahasa Indonesia yang baku.
      
      Format ringkasan harus seperti ini (Gunakan bullet points agar mudah dibaca):
      - 🎯 Tujuan Penelitian: ...
      - ⚙️ Metodologi: ...
      - 📊 Hasil Temuan: ...
      - 💡 Kesimpulan: ...

      Teks Jurnal Asli:
      "${text}"
    `;

    const result = await model.generateContent(promptText);
    const textOutput = result.response.text();

    return NextResponse.json({ result: textOutput.trim() });

  } catch (error: any) {
    console.error('Error proses ringkasan:', error);
    return NextResponse.json({ error: `Gagal memproses AI: ${error.message}` }, { status: 500 });
  }
}