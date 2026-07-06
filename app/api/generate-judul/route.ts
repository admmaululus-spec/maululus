import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'edge';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { universitas, jurusan, minat, masalah, metodologi, jenisKarya } = body;

    if (!jurusan || !universitas) {
      return NextResponse.json({ error: 'Universitas dan Jurusan harus diisi' }, { status: 400 });
    }

    // Batasi input untuk keamanan
    const safeUniversitas = String(universitas).substring(0, 100);
    const safeJurusan = String(jurusan).substring(0, 100);
    const safeMinat = minat ? String(minat).substring(0, 300) : '';
    const safeMasalah = masalah ? String(masalah).substring(0, 500) : '';
    const safeMetodologi = metodologi ? String(metodologi).substring(0, 100) : '';
    const safeKarya = jenisKarya ? String(jenisKarya).substring(0, 50) : 'S1 - Skripsi';

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    const promptText = `
      Kamu adalah Dosen Penguji Senior sekaligus asisten akademik ahli di ${safeUniversitas}.
      
      Tugas Pertamamu: Analisis input program studi/jurusan berikut: "${safeJurusan}".
      Jika input tersebut typo parah, tidak masuk akal (misal: "makan nasi", "asdfg"), di luar konteks akademik, atau bukan nama jurusan yang lazim, kamu WAJIB menolak dan memberikan teguran.
      
      Tugas Keduamu: Jika jurusan valid, buatkan 3 ide judul untuk ${safeKarya} yang inovatif dan ANTI-PASARAN khusus untuk standar ${safeUniversitas}.
      ${safeMinat ? `Topik spesifik/minat: "${safeMinat}".` : ''}
      ${safeMasalah ? `Masalah/Fenomena: "${safeMasalah}".` : ''}
      ${safeMetodologi && safeMetodologi !== 'Bebas (AI yang tentukan)' ? `Metodologi wajib: "${safeMetodologi}".` : ''}
      
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
    let textOutput = result.response.text();

    try {
      // JSON Sanitizer: Hapus markdown block ```json jika AI membandel
      textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
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