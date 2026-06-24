import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { text, action, judulSkripsi, namaBab } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Teks tidak boleh kosong' }, { status: 400 });
    }

    // Menggunakan 1.5 Flash untuk respons secepat kilat dan stabil
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    let promptText = '';
    const konteks = `Judul Skripsi: "${judulSkripsi}". Sedang menulis bagian: "${namaBab}".\n\n`;

    switch (action) {
      case 'paraphrase':
        promptText = `Kamu adalah dosen pembimbing ahli. ${konteks}Lakukan parafrase pada teks berikut agar lebih unik, terhindar dari plagiarisme (Turnitin), namun WAJIB menjaga makna aslinya. Gunakan bahasa Indonesia baku, akademis, dan hindari gaya bahasa robot.\n\nTeks asli:\n"${text}"\n\nBalas langsung dengan hasil parafrase tanpa teks pembuka/penutup.`;
        break;
      case 'expand':
        promptText = `Kamu adalah dosen pembimbing ahli. ${konteks}Kembangkan teks atau poin-poin singkat berikut menjadi 1 atau 2 paragraf utuh yang kohesif, sangat mendetail, dan menggunakan gaya bahasa akademis skripsi.\n\nTeks asli:\n"${text}"\n\nBalas langsung dengan hasil pengembangan tanpa teks pembuka/penutup.`;
        break;
      case 'formalize':
        promptText = `Kamu adalah editor jurnal ilmiah. ${konteks}Perbaiki tata bahasa, ejaan (PUEBI), dan struktur kalimat pada teks berikut agar menjadi bahasa Indonesia yang sangat baku, profesional, dan pantas untuk masuk ke dalam dokumen skripsi/tesis.\n\nTeks asli:\n"${text}"\n\nBalas langsung dengan hasil perbaikan tanpa teks pembuka/penutup.`;
        break;
      default:
        return NextResponse.json({ error: 'Aksi tidak dikenali' }, { status: 400 });
    }

    const result = await model.generateContent(promptText);
    const output = result.response.text().trim();

    return NextResponse.json({ result: output });

  } catch (error: any) {
    console.error('Error Copilot API:', error);
    return NextResponse.json({ error: `Gagal memproses teks: ${error.message}` }, { status: 500 });
  }
}