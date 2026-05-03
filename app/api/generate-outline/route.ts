import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';


export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { judul } = await req.json();

    if (!judul) {
      return NextResponse.json({ error: 'Judul harus dipilih' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

    // PROMPT BARU: Memaksa AI membuat array subBab yang terpisah
    const promptText = `
      Kamu adalah asisten akademik ahli. Buatkan kerangka skripsi (outline) detail dan terstruktur dari BAB 1 hingga BAB 5 untuk skripsi dengan judul: "${judul}".
      
      ATURAN PENTING:
      Balas HANYA dengan format JSON Array yang berisi object. 
      Setiap object mewakili satu Bab, dan WAJIB memiliki properti "bab" dan array "subBab".
      Setiap item di dalam "subBab" harus memiliki "judul" (misal: 1.1 Latar Belakang) dan "deskripsi" (penjelasan singkat isi sub bab tersebut dalam 2-3 kalimat).
      
      Formatnya harus persis seperti ini tanpa ada teks lain atau markdown:
      [
        {
          "bab": "BAB 1: PENDAHULUAN",
          "subBab": [
            {
              "judul": "1.1 Latar Belakang Masalah",
              "deskripsi": "Berisi fenomena kesenjangan antara harapan dan kenyataan terkait topik..."
            },
            {
              "judul": "1.2 Rumusan Masalah",
              "deskripsi": "Berisi pertanyaan-pertanyaan penelitian yang akan dijawab..."
            }
          ]
        },
        {
          "bab": "BAB 2: TINJAUAN PUSTAKA",
          "subBab": [
            {
              "judul": "2.1 Landasan Teori",
              "deskripsi": "Menguraikan teori utama dan pendukung yang relevan dengan topik..."
            }
          ]
        }
      ]
      (Lanjutkan sampai BAB 5 secara lengkap, detail, dan logis sesuai judul).
    `;

    const result = await model.generateContent(promptText);
    const response = await result.response;
    const textOutput = response.text();

    const cleanJsonString = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    const outlineArray = JSON.parse(cleanJsonString);

    return NextResponse.json({ outline: outlineArray });

  } catch (error: any) {
    console.error('Error generating outline:', error);
    return NextResponse.json({ error: `Gagal menyusun kerangka: ${error.message}` }, { status: 500 });
  }
}