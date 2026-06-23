import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { universitas, jurusan, minat, masalah, metodologi, jenisKarya } = body;

    if (!jurusan || !universitas) {
      return NextResponse.json({ error: 'Universitas dan Jurusan harus diisi' }, { status: 400 });
    }

    // Menggunakan 1.5-flash karena sangat stabil, cepat, dan jarang error 503
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.1-flash-lite',
      generationConfig: {
        responseMimeType: "application/json", // Paksa Gemini balas pakai JSON murni
        temperature: 0.7
      }
    });

    const promptText = `
      Kamu adalah Dosen Penguji Senior sekaligus asisten akademik ahli di ${universitas}.
      
      Tugas Pertamamu: Analisis input program studi/jurusan berikut: "${jurusan}".
      Jika input tersebut typo parah, tidak masuk akal (misal: "makan nasi", "asdfg"), di luar konteks akademik, atau bukan nama jurusan yang lazim, kamu WAJIB menolak dan memberikan teguran.
      
      Tugas Keduamu: Jika jurusan valid, buatkan 3 ide judul untuk ${jenisKarya || 'S1 - Skripsi'} yang inovatif dan ANTI-PASARAN khusus untuk standar ${universitas}.
      ${minat ? `Topik spesifik/minat: "${minat}".` : ''}
      ${masalah ? `Masalah/Fenomena: "${masalah}".` : ''}
      ${metodologi && metodologi !== 'Bebas (AI yang tentukan)' ? `Metodologi wajib: "${metodologi}".` : ''}
      
      ATURAN BALASAN (WAJIB JSON FORMAT):
      Jika JURUSAN TIDAK VALID:
      {
        "status": "invalid",
        "pesan": "Tuliskan pesan teguran halus. Contoh: 'Hmm, sepertinya [input] bukan nama program studi yang wajar.'"
      }

      Jika JURUSAN VALID:
      {
        "status": "success",
        "data": [
          {
            "judul": "Judul Skripsi 1",
            "alasan": "Alasan akademis yang meyakinkan mengapa judul ini sangat relevan dan menarik.",
            "novelty_check": "Analisis kebaruan: Jelaskan pembedanya dari skripsi terdahulu."
          }
        ]
      }
    `;

    const result = await model.generateContent(promptText);
    const textOutput = result.response.text();

    try {
      const parsedData = JSON.parse(textOutput);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("Gagal parse JSON dari AI:", textOutput);
      return NextResponse.json({ error: `Format balasan AI salah.` }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error server API:', error);
    return NextResponse.json({ error: `Pesan Error Server: ${error.message || 'Unknown Error'}` }, { status: 500 });
  }
}