import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Teks tidak boleh kosong' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        temperature: 0.4, // Cukup rendah agar tetap baku dan tidak terlalu kreatif/melenceng
      }
    });

    const promptText = `
      Kamu adalah akademisi dan editor jurnal ahli. Tugasmu adalah mem-parafrase teks berikut agar lolos uji plagiarisme (Turnitin) namun tetap mempertahankan makna aslinya secara utuh. 
      
      Aturan:
      1. Gunakan bahasa Indonesia akademis yang baku, formal, dan natural.
      2. Jangan menambahkan opini pribadi atau informasi di luar teks asli.
      3. Langsung berikan hasil parafrasenya saja, tanpa salam pengantar atau penutup.

      Teks Asli:
      "${text}"
    `;

    const result = await model.generateContent(promptText);
    const textOutput = result.response.text();

    return NextResponse.json({ result: textOutput.trim() });

  } catch (error: any) {
    console.error('Error proses parafrase:', error);
    return NextResponse.json({ error: `Gagal memproses AI: ${error.message}` }, { status: 500 });
  }
}