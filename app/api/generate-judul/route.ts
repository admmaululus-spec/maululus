import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jurusan, minat } = body;

    if (!jurusan) {
      return NextResponse.json({ error: 'Jurusan harus diisi' }, { status: 400 });
    }

    // Cek apakah API Key terbaca oleh Next.js
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API Key Gemini belum terbaca. Coba restart .' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const promptText = `
      Kamu adalah asisten akademik ahli yang membantu mahasiswa menyusun judul skripsi.
      Buatkan 5 ide judul skripsi yang inovatif, akademis, dan realistis untuk mahasiswa program studi: "${jurusan}".
      ${minat ? `Topik spesifik atau minat mahasiswa adalah: "${minat}".` : ''}
      
      ATURAN PENTING:
      Kamu HANYA boleh membalas dengan format JSON Array yang berisi string (daftar judul). 
      Jangan tambahkan teks pembuka, penutup, atau format markdown.
      
      Contoh format balasan yang benar:
      ["Judul 1", "Judul 2", "Judul 3"]
    `;

    const result = await model.generateContent(promptText);
    const response = await result.response;
    const textOutput = response.text();

    try {
      // Mencoba parse respons AI ke format JSON
      const cleanJsonString = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      const titlesArray = JSON.parse(cleanJsonString);
      return NextResponse.json({ judul: titlesArray });
    } catch (parseError) {
      // Jika AI membalas dengan format yang tidak bisa di-parse
      return NextResponse.json({ error: `Format balasan AI salah: ${textOutput}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error server API:', error);
    // Mengirimkan pesan error asli dari Gemini API ke UI
    return NextResponse.json({ error: `Pesan Error Server: ${error.message || 'Unknown Error'}` }, { status: 500 });
  }
}