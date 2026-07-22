import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'edge';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const { judul } = await req.json();

    if (!judul) return NextResponse.json({ error: 'Judul harus dipilih' }, { status: 400 });
    
    const { data: pricingData } = await supabase.from('ai_tools_pricing').select('koin').eq('id', 'outline').single();
    const HARGA_KOIN = pricingData?.koin !== undefined ? pricingData.koin : 5;

    // PERBAIKAN: Gunakan users_data
    const { data: profile } = await supabase.from('users_data').select('koin').eq('id', userId).single();
    const currentKoin = profile?.koin || 0;

    if (currentKoin < HARGA_KOIN) return NextResponse.json({ error: `Koin tidak cukup! Butuh ${HARGA_KOIN} Koin.` }, { status: 402 });

    if (HARGA_KOIN > 0) {
      const { error: deductError } = await supabase.from('users_data').update({ koin: currentKoin - HARGA_KOIN }).eq('id', userId);
      if (deductError) throw new Error("Gagal memotong koin");
    }

    await supabase.from('ai_tools_history').insert({ user_id: userId, tool_name: 'Buat Outline', input_data: `Judul: ${String(judul).substring(0, 30)}...` });

    const safeJudul = String(judul).substring(0, 300);

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite', generationConfig: { responseMimeType: "application/json", temperature: 0.3 } });

    const promptText = `Kamu adalah Profesor ahli. Buatkan kerangka skripsi (outline) detail dari BAB 1 hingga BAB 5, dan SATU BAB TAMBAHAN berisi Rekomendasi Jurnal untuk skripsi berjudul: "${safeJudul}".
      PENTING: Buat JSON Object dengan root key "outline" yang berisi array of objects.
      Format persis seperti ini:
      {
        "outline": [
          { "bab": "BAB 1: PENDAHULUAN", "subBab": [ { "judul": "1.1 Latar Belakang", "deskripsi": "..." } ] },
          { "bab": "📚 REKOMENDASI LITERATUR & REFERENSI JURNAL", "subBab": [ { "judul": "1. Grand Theory", "deskripsi": "..." } ] }
        ]
      }`;

    const result = await model.generateContent(promptText);
    let textOutput = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedData: any = {};
    try { parsedData = JSON.parse(textOutput); } 
    catch (e) { return NextResponse.json({ error: 'Gagal membaca format data dari AI' }, { status: 500 }); }

    let outlineArray = parsedData.outline || [];

    // Fallback Semantic Scholar
    try {
      const searchKeyword = safeJudul.replace(/(analisis|pengaruh|implementasi|terhadap|dengan|berbasis|untuk|dan|di|pada)/gi, '').trim().substring(0, 100);
      const s2Url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(searchKeyword)}&limit=3&fields=title,authors,year,url`;
      const s2Response = await fetch(s2Url);
      if (s2Response.ok) {
        const s2Data = await s2Response.json();
        if (s2Data.data && s2Data.data.length > 0) {
          const realJournals = s2Data.data.map((paper: any, index: number) => {
            const authorNames = paper.authors && paper.authors.length > 0 ? paper.authors.map((a: any) => a.name).join(', ') : 'Penulis Anonim';
            return { judul: `🔗 Jurnal Asli Terkait ${index + 1}: ${paper.title} (${paper.year || 'N/A'})`, deskripsi: `Ditulis oleh: ${authorNames}. Referensi otomatis dari Semantic Scholar Database.`, url_asli: paper.url };
          });
          const refIndex = outlineArray.findIndex((item: any) => item.bab.includes('REFERENSI') || item.bab.includes('📚'));
          if (refIndex !== -1) outlineArray[refIndex].subBab.push(...realJournals);
          else outlineArray.push({ bab: "📚 REFERENSI JURNAL ASLI", subBab: realJournals });
        }
      }
    } catch (apiError) { console.log("Semantic Scholar API gagal"); }

    return NextResponse.json({ outline: outlineArray, sisa_koin: currentKoin - HARGA_KOIN });

  } catch (error: any) {
    return NextResponse.json({ error: `Gagal menyusun kerangka: ${error.message}` }, { status: 500 });
  }
}