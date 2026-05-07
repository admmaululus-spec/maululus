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

    // ==========================================
    // 1. GENERATE KERANGKA DENGAN GEMINI AI
    // ==========================================
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

    const promptText = `
      Kamu adalah Profesor ahli. Buatkan kerangka skripsi (outline) detail dari BAB 1 hingga BAB 5 untuk skripsi berjudul: "${judul}".
      
      Balas HANYA dengan format JSON Array yang berisi object. Tidak boleh ada teks markdown di luar JSON.
      Setiap object mewakili satu Bab (bab) dan array subBab.
      Setiap item di dalam "subBab" harus memiliki "judul" dan "deskripsi".
      
      Contoh format:
      [
        {
          "bab": "BAB 1: PENDAHULUAN",
          "subBab": [
            { "judul": "1.1 Latar Belakang", "deskripsi": "..." }
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
    // 2. AMBIL JURNAL ASLI DARI SEMANTIC SCHOLAR API
    // ==========================================
    try {
      // Kita cari jurnal relevan menggunakan API Semantic Scholar
      const s2Url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(judul)}&limit=4&fields=title,authors,year,url`;
      const s2Response = await fetch(s2Url);
      
      if (s2Response.ok) {
        const s2Data = await s2Response.json();
        
        if (s2Data.data && s2Data.data.length > 0) {
          // Format hasil dari Semantic Scholar menjadi SubBab
          const realJournals = s2Data.data.map((paper: any, index: number) => {
            const authorNames = paper.authors && paper.authors.length > 0 
              ? paper.authors.map((a: any) => a.name).join(', ') 
              : 'Penulis Anonim';
              
            return {
              judul: `${index + 1}. ${paper.title} (${paper.year || 'N/A'})`,
              deskripsi: `Penulis: ${authorNames}`,
              url_asli: paper.url // KITA SIMPAN URL ASLINYA DI SINI
            };
          });

          // Tambahkan BAB Referensi Asli ke bagian paling bawah outline
          outlineArray.push({
            bab: "📚 REFERENSI JURNAL ASLI (SEMANTIC SCHOLAR)",
            subBab: realJournals
          });
        }
      }
    } catch (apiError) {
      console.log("Semantic Scholar API error, dilewati.", apiError);
      // Jika API error, aplikasi tidak akan crash, hanya skip bagian jurnal
    }

    return NextResponse.json({ outline: outlineArray });

  } catch (error: any) {
    console.error('Error generating outline:', error);
    return NextResponse.json({ error: `Gagal menyusun kerangka: ${error.message}` }, { status: 500 });
  }
}