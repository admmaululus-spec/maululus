import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Wajib ditambahkan agar API bisa berjalan di infrastruktur Cloudflare Pages
export const runtime = 'edge';

// Inisialisasi Google Gen AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jurusan, minat } = body;

    if (!jurusan) {
      return NextResponse.json({ error: 'Jurusan harus diisi' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const promptText = `
      Kamu adalah asisten akademik ahli yang membantu mahasiswa menyusun judul skripsi.
      Buatkan 5 ide judul skripsi yang inovatif, akademis, dan realistis untuk mahasiswa program studi: "${jurusan}".
      ${minat ? `Topik spesifik atau minat mahasiswa adalah: "${minat}".` : ''}
      
      ATURAN PENTING:
      Kamu HANYA boleh membalas dengan format JSON Array yang berisi string (daftar judul). 
      Jangan tambahkan teks pembuka, penutup, atau format markdown (seperti \`\`\`json).
      
      Contoh format balasan yang benar:
      ["Judul 1", "Judul 2", "Judul 3"]
    `;

    const result = await model.generateContent(promptText);
    const response = await result.response;
    const textOutput = response.text();

    const cleanJsonString = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    const titlesArray = JSON.parse(cleanJsonString);

    return NextResponse.json({ judul: titlesArray });

  } catch (error) {
    console.error('Error generating titles:', error);
    return NextResponse.json({ error: 'Gagal memproses request dari AI' }, { status: 500 });
  }
}