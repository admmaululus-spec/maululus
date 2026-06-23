import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'edge';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const { text, action, judulSkripsi, namaBab } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Teks tidak boleh kosong' }, { status: 400 });
    }

    let systemPrompt = `Kamu adalah dosen pembimbing ahli. Judul Skripsi: "${judulSkripsi}". Sedang menulis: "${namaBab}".\nBalas langsung dengan hasil teks tanpa sapaan pembuka/penutup.`;
    
    let userPrompt = '';

    switch (action) {
      case 'paraphrase':
        userPrompt = `Lakukan parafrase pada teks berikut agar lebih unik, terhindar dari plagiarisme (Turnitin), namun WAJIB menjaga makna aslinya. Gunakan bahasa Indonesia baku dan akademis.\nTeks asli:\n"${text}"`;
        break;
      case 'expand':
        userPrompt = `Kembangkan teks/poin berikut menjadi 1-2 paragraf utuh yang kohesif, sangat mendetail, dan menggunakan gaya bahasa akademis skripsi.\nTeks asli:\n"${text}"`;
        break;
      case 'formalize':
        userPrompt = `Perbaiki tata bahasa, ejaan (PUEBI), dan struktur kalimat pada teks berikut agar menjadi bahasa Indonesia yang sangat baku, profesional, dan pantas masuk ke dokumen skripsi.\nTeks asli:\n"${text}"`;
        break;
      default:
        return NextResponse.json({ error: 'Aksi tidak dikenali' }, { status: 400 });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      // Menggunakan model 'instant' agar tombol Copilot merespons super cepat
      model: 'llama-3.1-8b-instant', 
      temperature: 0.4,
    });

    const output = chatCompletion.choices[0]?.message?.content?.trim() || '';

    return NextResponse.json({ result: output });

  } catch (error: any) {
    console.error('Error Copilot API:', error);
    return NextResponse.json({ error: `Gagal memproses teks: ${error.message}` }, { status: 500 });
  }
}