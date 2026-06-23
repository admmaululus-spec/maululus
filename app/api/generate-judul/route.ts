import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'edge';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { universitas, jurusan, minat, masalah, metodologi, jenisKarya } = body;

    if (!jurusan || !universitas) {
      return NextResponse.json({ error: 'Universitas dan Jurusan harus diisi' }, { status: 400 });
    }

    const systemPrompt = `Kamu adalah Dosen Penguji Senior sekaligus asisten akademik ahli di ${universitas}.
    Keluarkan HANYA format JSON Object murni. Tidak boleh ada teks pembuka/penutup.
    
    ATURAN BALASAN (JSON OBJECT):
    Jika JURUSAN TIDAK VALID (typo parah, tidak masuk akal, bukan prodi wajar), balas:
    {
      "status": "invalid",
      "pesan": "Hmm, sepertinya itu bukan nama program studi yang wajar. Apakah maksudmu jurusan terkait?"
    }

    Jika JURUSAN VALID, buatkan 3 ide judul yang inovatif, ANTI-PASARAN namun masuk akal, balas:
    {
      "status": "success",
      "data": [
        {
          "judul": "...",
          "alasan": "...",
          "novelty_check": "..."
        }
      ]
    }`;

    let userContent = `Analisis jurusan: "${jurusan}". Buat judul untuk ${jenisKarya || 'S1 - Skripsi'}.`;
    if (minat) userContent += `\nMinat/Topik: "${minat}"`;
    if (masalah) userContent += `\nMasalah: "${masalah}"`;
    if (metodologi && metodologi !== 'Bebas (AI yang tentukan)') userContent += `\nMetodologi: "${metodologi}"`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }, // Garansi tidak akan error JSON.parse
      temperature: 0.6, // Sedikit dinaikkan agar judulnya lebih kreatif
    });

    const textOutput = chatCompletion.choices[0]?.message?.content || '{}';
    const parsedData = JSON.parse(textOutput);
    
    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Error server API:', error);
    return NextResponse.json({ error: `Pesan Error Server: ${error.message || 'Unknown Error'}` }, { status: 500 });
  }
}