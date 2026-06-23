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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // ==========================================
    // 1. GENERATE KERANGKA (TERMASUK REFERENSI DASAR)
    // ==========================================
    const promptText = `
      Kamu adalah Profesor ahli. Buatkan kerangka skripsi (outline) detail dari BAB 1 hingga BAB 5, dan SATU BAB TAMBAHAN berisi Rekomendasi Jurnal untuk skripsi berjudul: "${judul}".
      
      Balas HANYA dengan format JSON Array yang berisi object. Tidak boleh ada teks markdown di luar JSON.
      Setiap object mewakili satu Bab ("bab") dan array "subBab".
      Setiap item di dalam "subBab" harus memiliki "judul" dan "deskripsi" (2-3 kalimat).
      
      Format wajib persis seperti ini:
      [
        {
          "bab": "BAB 1: PENDAHULUAN",
          "subBab": [ { "judul": "1.1 Latar Belakang", "deskripsi": "..." } ]
        },
        ... (Lanjutkan sampai BAB 5 yang logis),
        {
          "bab": "📚 REKOMENDASI LITERATUR & REFERENSI JURNAL",
          "subBab": [
            {
              "judul": "1. Grand Theory (Teori Utama)",
              "deskripsi": "Sebutkan 1-2 teori utama yang wajib dipakai untuk topik ini..."
            },
            {
              "judul": "2. Kata Kunci Google Scholar",
              "deskripsi": "Gunakan kata kunci pencarian berikut: ..."
            }
          ]
        }
      ]
    `;

    const result = await model.generateContent(promptText);
    const response = await result.response;
    const textOutput = response.text();

    const cleanJsonString = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    let outlineArray = JSON.parse(cleanJsonString);

    // ==========================================
    // 2. AMBIL JURNAL ASLI (INJECT DARI SEMANTIC SCHOLAR)
    // ==========================================
    try {
      // Kita bersihkan judul dari kata hubung agar pencarian API lebih akurat
      const searchKeyword = judul.replace(/(analisis|pengaruh|implementasi|terhadap|dengan|berbasis|untuk|dan|di|pada)/gi, '').trim();
      
      const s2Url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(searchKeyword)}&limit=3&fields=title,authors,year,url`;
      const s2Response = await fetch(s2Url);
      
      if (s2Response.ok) {
        const s2Data = await s2Response.json();
        
        if (s2Data.data && s2Data.data.length > 0) {
          const realJournals = s2Data.data.map((paper: any, index: number) => {
            const authorNames = paper.authors && paper.authors.length > 0 
              ? paper.authors.map((a: any) => a.name).join(', ') 
              : 'Penulis Anonim';
              
            return {
              judul: `🔗 Jurnal Asli Terkait ${index + 1}: ${paper.title} (${paper.year || 'N/A'})`,
              deskripsi: `Ditulis oleh: ${authorNames}. Referensi otomatis dari Semantic Scholar Database.`,
              url_asli: paper.url
            };
          });

          // Cari indeks BAB Referensi yang dibuat oleh Gemini
          const refIndex = outlineArray.findIndex((item: any) => item.bab.includes('REFERENSI') || item.bab.includes('📚'));
          
          if (refIndex !== -1) {
            // Suntikkan jurnal asli ke dalam BAB referensi tersebut!
            outlineArray[refIndex].subBab.push(...realJournals);
          } else {
            // Jika Gemini kebetulan lupa bikin bab referensi, kita buatkan bab baru
            outlineArray.push({
              bab: "📚 REFERENSI JURNAL ASLI",
              subBab: realJournals
            });
          }
        }
      }
    } catch (apiError) {
      console.log("Semantic Scholar API gagal, fallback ke referensi Gemini berjalan aman.");
    }

    return NextResponse.json({ outline: outlineArray });

  } catch (error: any) {
    console.error('Error generating outline:', error);
    return NextResponse.json({ error: `Gagal menyusun kerangka: ${error.message}` }, { status: 500 });
  }
}