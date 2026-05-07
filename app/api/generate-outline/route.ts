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

    // PROMPT BARU: Ditambah instruksi wajib untuk Rekomendasi Jurnal & Link Google Scholar
    const promptText = `
      Kamu adalah Profesor dan Dosen Pembimbing Skripsi ahli. Buatkan kerangka skripsi (outline) detail dari BAB 1 hingga BAB 5, dan SATU BAB TAMBAHAN berisi Rekomendasi Jurnal untuk skripsi dengan judul: "${judul}".
      
      ATURAN PENTING:
      Balas HANYA dengan format JSON Array yang berisi object. Tidak boleh ada teks markdown di luar JSON.
      Setiap object mewakili satu Bab, dan WAJIB memiliki properti "bab" dan array "subBab".
      Setiap item di dalam "subBab" harus memiliki "judul" dan "deskripsi" (penjelasan singkat 2-3 kalimat).
      
      Formatnya harus persis seperti ini:
      [
        {
          "bab": "BAB 1: PENDAHULUAN",
          "subBab": [
            {
              "judul": "1.1 Latar Belakang Masalah",
              "deskripsi": "Berisi fenomena kesenjangan antara harapan dan kenyataan terkait topik..."
            }
          ]
        },
        ... (lanjutkan BAB 2, BAB 3, BAB 4, BAB 5 secara lengkap dan logis),
        {
          "bab": "📚 REKOMENDASI LITERATUR & REFERENSI JURNAL",
          "subBab": [
            {
              "judul": "1. Grand Theory (Teori Utama)",
              "deskripsi": "Sebutkan 1-2 teori utama yang wajib dipakai (Misal: Technology Acceptance Model, dll) yang mendasari penelitian ini."
            },
            {
              "judul": "2. Rekomendasi Jurnal Terkait (Penulis, Tahun)",
              "deskripsi": "Sebutkan 3 judul jurnal spesifik yang sangat relevan. Keyword Pencarian: [Tulis Keyword 1], [Tulis Keyword 2]. Cari langsung di: https://scholar.google.com/scholar?q=[Keyword+Pencarian+Utama+Tanpa+Spasi]"
            },
            {
              "judul": "💡 Catatan Penting Untuk Mahasiswa",
              "deskripsi": "Silakan salin kata kunci (keyword) di atas atau klik link Google Scholar yang disediakan untuk mengunduh PDF jurnal aslinya sebagai referensi Bab 2 kamu."
            }
          ]
        }
      ]
    `;

    const result = await model.generateContent(promptText);
    const response = await result.response;
    const textOutput = response.text();

    // Membersihkan markdown JSON (jika AI membandel menambahkannya)
    const cleanJsonString = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    const outlineArray = JSON.parse(cleanJsonString);

    return NextResponse.json({ outline: outlineArray });

  } catch (error: any) {
    console.error('Error generating outline:', error);
    return NextResponse.json({ error: `Gagal menyusun kerangka: ${error.message}` }, { status: 500 });
  }
}