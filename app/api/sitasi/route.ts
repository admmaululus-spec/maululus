import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { input_data, format_style = "APA" } = await req.json();

    if (!input_data) {
      return NextResponse.json({ error: 'Data/Judul jurnal tidak boleh kosong' }, { status: 400 });
    }

    // Gunakan model Flash karena sangat cepat untuk pemrosesan teks
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    const prompt = `
      Kamu adalah asisten akademik ahli. Pengguna memberikan data mentah, judul, atau kutipan jurnal berikut:
      "${input_data}"

      Tugasmu:
      1. Ekstrak atau tebak informasi metadata (Penulis, Tahun, Judul, Jurnal/Penerbit).
      2. Buatkan sitasi (kutipan dalam teks / in-text citation).
      3. Buatkan Daftar Pustaka lengkap dengan format ${format_style} (misal: APA 7th Edition, Harvard, atau MLA).
      4. Format hasilnya dalam format JSON dengan struktur berikut:
      {
        "in_text_citation": "(Penulis, Tahun)",
        "bibliography": "Penulis. (Tahun). Judul. Jurnal...",
        "style_used": "${format_style}"
      }

      Hanya kembalikan JSON, tanpa teks markdown lainnya (tanpa \`\`\`json).
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parsing JSON dari Gemini
    const sitasiData = JSON.parse(responseText.trim());

    return NextResponse.json({ result: sitasiData });

  } catch (error: any) {
    console.error('Error generate sitasi:', error);
    return NextResponse.json({ error: `Gagal menyusun sitasi: ${error.message}` }, { status: 500 });
  }
}