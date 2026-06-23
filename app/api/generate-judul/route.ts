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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const promptText = `
      Kamu adalah Dosen Penguji Senior sekaligus asisten akademik ahli di ${universitas}.
      
      Tugas Pertamamu: Analisis input program studi/jurusan berikut: "${jurusan}".
      Jika input tersebut typo parah, tidak masuk akal (misal: "makan nasi", "asdfg"), di luar konteks akademik, atau bukan nama jurusan yang lazim, kamu WAJIB menolak dan memberikan teguran.
      
      Tugas Keduamu: Jika jurusan valid, buatkan 3 ide judul untuk ${jenisKarya || 'S1 - Skripsi'} yang inovatif dan ANTI-PASARAN khusus untuk standar ${universitas}.
      ${minat ? `Topik spesifik/minat: "${minat}".` : ''}
      ${masalah ? `Masalah/Fenomena: "${masalah}".` : ''}
      ${metodologi && metodologi !== 'Bebas (AI yang tentukan)' ? `Metodologi wajib: "${metodologi}".` : ''}
      
      Kriteria Ketat: Tingkat kedalaman WAJIB disesuaikan untuk ${jenisKarya || 'S1 - Skripsi'}. Hindari judul klise yang sudah menumpuk di perpustakaan kampus tersebut, namun hindari juga penggunaan kata yang tidak lazim terutama untuk skripsi S-1 buat lebih mudah untuk acc ke dosen.

      ATURAN BALASAN (WAJIB JSON FORMAT MURNI):
      Jika JURUSAN TIDAK VALID, balas dengan format ini:
      {
        "status": "invalid",
        "pesan": "Tuliskan pesan teguran halus. Contoh: 'Hmm, sepertinya [input] bukan nama program studi yang wajar. Apakah maksudmu jurusan terkait?'"
      }

      Jika JURUSAN VALID, balas dengan format ini:
      {
        "status": "success",
        "data": [
          {
            "judul": "Judul Skripsi 1",
            "alasan": "Alasan akademis yang meyakinkan mengapa judul ini sangat relevan dan menarik.",
            "novelty_check": "Analisis kebaruan: Jelaskan secara singkat kenapa judul ini belum banyak diteliti di ${universitas} atau apa pembedanya dari skripsi terdahulu."
          }
        ]
      }
      
      Keluarkan HANYA format JSON murni, tanpa backticks (\`\`\`), tanpa teks pembuka/penutup.
    `;

    const result = await model.generateContent(promptText);
    const textOutput = await result.response.text();

    try {
      // Membersihkan potensi markdown code blocks dari AI sebelum parse
      const cleanJsonString = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJsonString);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("Gagal parse JSON dari AI:", textOutput);
      return NextResponse.json({ error: `Format balasan AI salah atau tidak mengenali instruksi JSON.` }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error server API:', error);
    return NextResponse.json({ error: `Pesan Error Server: ${error.message || 'Unknown Error'}` }, { status: 500 });
  }
}