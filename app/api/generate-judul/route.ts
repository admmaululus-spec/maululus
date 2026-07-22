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
    
    let freeUsageCount = 0;
    if (!session) {
      freeUsageCount = parseInt(cookieStore.get('free_gen_count')?.value || '0', 10);
      if (freeUsageCount >= 2) {
        return NextResponse.json({ error: 'Batas penggunaan tercapai. Silakan Masuk / Daftar Akun untuk Unlimited Generate' }, { status: 401 });
      }
    }

    const body = await req.json();
    const { universitas, jurusan, minat, masalah, metodologi, jenisKarya } = body;

    if (!jurusan || !universitas) {
      return NextResponse.json({ error: 'Universitas dan Jurusan harus diisi' }, { status: 400 });
    }

    let currentKoin = 0;
    let HARGA_KOIN = 0;

    if (session) {
      const userId = session.user.id;
      const { data: pricingData } = await supabase.from('ai_tools_pricing').select('koin').eq('id', 'generator').single();
      HARGA_KOIN = pricingData?.koin !== undefined ? pricingData.koin : 5;

      // PERBAIKAN: Gunakan users_data
      const { data: profile } = await supabase.from('users_data').select('koin').eq('id', userId).single();
      currentKoin = profile?.koin || 0;

      if (currentKoin < HARGA_KOIN) {
        return NextResponse.json({ error: `Koin tidak cukup! Butuh ${HARGA_KOIN} Koin.` }, { status: 402 });
      }

      if (HARGA_KOIN > 0) {
        const { error: deductError } = await supabase.from('users_data').update({ koin: currentKoin - HARGA_KOIN }).eq('id', userId);
        if (deductError) throw new Error("Gagal memotong koin di database.");
      }

      await supabase.from('ai_tools_history').insert({ user_id: userId, tool_name: 'Buat Judul', input_data: `Jurusan: ${String(jurusan).substring(0,25)}...` });
    }

    const safeUniversitas = String(universitas).substring(0, 100);
    const safeJurusan = String(jurusan).substring(0, 100);
    const safeMinat = minat ? String(minat).substring(0, 300) : '';
    const safeMasalah = masalah ? String(masalah).substring(0, 500) : '';
    const safeMetodologi = metodologi ? String(metodologi).substring(0, 100) : '';
    const safeKarya = jenisKarya ? String(jenisKarya).substring(0, 50) : 'S1 - Skripsi';

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.5-flash-lite',
      generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
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
      textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(textOutput);
      
      const responseData = {
        ...parsedData,
        sisa_koin: session ? (currentKoin - HARGA_KOIN) : null,
        sisa_percobaan_gratis: !session ? 1 - freeUsageCount : null
      };

      const response = NextResponse.json(responseData);

      if (!session) {
        response.cookies.set('free_gen_count', (freeUsageCount + 1).toString(), {
          path: '/', maxAge: 60 * 60 * 24 * 30, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
        });
      }

      return response;
    } catch (parseError) {
      return NextResponse.json({ error: `Format balasan AI salah.` }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: `Pesan Error Server: ${error.message || 'Unknown Error'}` }, { status: 500 });
  }
}