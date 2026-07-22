// app/lib/similarity/services.ts

import { PaperReference } from './types';
import { extractKeywords } from './utils';

// 1. FETCH EXTERNAL DATABASES (OpenAlex, Crossref, Semantic Scholar)
export async function fetchAcademicSources(query: string): Promise<PaperReference[]> {
  const keywords = extractKeywords(query);
  if (!keywords) return [];

  const papers: PaperReference[] = [];
  const limit = 2; // Ambil 2 teratas dari tiap sumber agar tidak timeout

  try {
    const [oaRes, crRes, ssRes] = await Promise.allSettled([
      fetch(`https://api.openalex.org/works?search=${encodeURIComponent(keywords)}&per-page=${limit}`, { 
        headers: { 'Accept': 'application/json' } 
      }),
      fetch(`https://api.crossref.org/works?query=${encodeURIComponent(keywords)}&select=URL,title,author,issued,container-title,DOI&rows=${limit}&mailto=admin@maululus.id`),
      fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(keywords)}&limit=${limit}&fields=title,authors,year,url,venue`, {
        headers: { 
          'User-Agent': 'Maululus-App/1.0', 
          ...(process.env.SEMANTIC_SCHOLAR_API_KEY && { 'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY }) 
        }
      })
    ]);

    // Parse OpenAlex
    if (oaRes.status === 'fulfilled' && oaRes.value.ok) {
      const data = await oaRes.value.json();
      data.results?.forEach((p: any) => {
        papers.push({
          title: p.title || 'Unknown Title',
          authors: p.authorships?.map((a: any) => a.author?.display_name).join(', ') || 'Unknown',
          year: p.publication_year || 'N/A',
          publisher: p.primary_location?.source?.display_name || 'OpenAlex',
          doi: p.doi || '-',
          url: p.doi || p.id,
          similarity: 0
        });
      });
    }

    // Parse Crossref
    if (crRes.status === 'fulfilled' && crRes.value.ok) {
      const data = await crRes.value.json();
      data.message?.items?.forEach((p: any) => {
        papers.push({
          title: p.title?.[0] || 'Unknown Title',
          authors: p.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`).join(', ') || 'Unknown',
          year: p.issued?.['date-parts']?.[0]?.[0] || 'N/A',
          publisher: p['container-title']?.[0] || 'Crossref',
          doi: p.DOI || '-',
          url: p.URL || '#',
          similarity: 0
        });
      });
    }

    // Parse Semantic Scholar
    if (ssRes.status === 'fulfilled' && ssRes.value.ok) {
      const data = await ssRes.value.json();
      data.data?.forEach((p: any) => {
        papers.push({
          title: p.title || 'Unknown Title',
          authors: p.authors?.map((a: any) => a.name).join(', ') || 'Unknown',
          year: p.year || 'N/A',
          publisher: p.venue || 'Semantic Scholar',
          doi: '-',
          url: p.url || '#',
          similarity: 0
        });
      });
    }
  } catch (error) {
    console.error("External DB Fetch Error:", error);
  }

  // Filter duplikat berdasarkan judul (case-insensitive)
  const uniquePapers = Array.from(new Map(papers.map(item => [item.title.toLowerCase(), item])).values());
  return uniquePapers;
}

// 2. GEMINI EMBEDDING
export async function getEmbedding(text: string): Promise<number[]> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) return [];

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text }] }
      })
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    return data.embedding?.values || [];
  } catch (e) {
    return [];
  }
}

// 3. GEMINI ANALYSIS (Menyusun Insight, Common Knowledge, dan Rekomendasi)
export async function generateAIAnalysis(structuredData: any): Promise<{ analysis: string, recommendation: string[], riskLevel: string }> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  // Menyiapkan pesan fallback elegan jika AI gagal/timeout
  const fallbackResponse = { 
    analysis: "Analisis mendalam tidak tersedia saat ini. Namun sistem menemukan beberapa paragraf yang memiliki tingkat kemiripan sedang hingga tinggi dengan database akademik. Disarankan melakukan parafrase pada bagian yang disorot sebelum dokumen dikumpulkan.", 
    recommendation: [
      "Gunakan fitur 'Perbaiki dengan AI' untuk memparafrase teks secara otomatis.",
      "Periksa kembali bagian yang disorot dengan warna oranye dan merah.",
      "Pastikan sitasi telah ditambahkan dengan benar."
    ], 
    riskLevel: "Risiko Sedang" 
  };

  if (!GEMINI_API_KEY) return fallbackResponse;

  const prompt = `
    Anda adalah sistem "AI Academic Similarity Checker" premium.
    Tugas Anda adalah menganalisis data similarity teks akademik ini dan memberikan hasil dalam format JSON murni.
    
    ATURAN DETEKSI:
    1. Abaikan kalimat umum (Common Knowledge).
    2. Fokus pada kalimat spesifik yang similarity-nya tinggi.
    
    DATA SIMILARITY:
    ${JSON.stringify(structuredData)}
    
    OUTPUT JSON WAJIB:
    {
      "analysis": "Tuliskan 2-3 paragraf analisis profesional mengenai letak plagiasi terbesar dan tipe kemiripan (apakah common knowledge, kutipan tidak tepat, atau copy-paste).",
      "recommendation": ["Saran aksi 1", "Saran aksi 2", "Saran aksi 3"],
      "riskLevel": "Sangat Aman" | "Risiko Rendah" | "Risiko Sedang" | "Risiko Tinggi"
    }
  `;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });
    
    const data = await res.json();
    const textRes = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Jika Gemini mengembalikan response kosong atau tidak sesuai
    if (!textRes) throw new Error("Respons AI Kosong");
    
    return JSON.parse(textRes);
  } catch (e) {
    console.error("Gagal memproses analisis AI:", e);
    // Mengembalikan fallback secara otomatis jika terjadi error
    return fallbackResponse;
  }
}