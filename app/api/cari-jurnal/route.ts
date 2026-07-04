import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query pencarian tidak boleh kosong' }, { status: 400 });
    }

    // Bersihkan kata hubung agar pencarian di Semantic Scholar lebih optimal
    const searchKeyword = query.replace(/(analisis|pengaruh|implementasi|terhadap|dengan|berbasis|untuk|dan|di|pada|studi|kasus)/gi, '').trim();
    
    // Ambil 5 jurnal teratas. Field yang diambil: title, authors, year, url, venue (nama jurnal)
    const limit = 5;
    const s2Url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(searchKeyword)}&limit=${limit}&fields=title,authors,year,url,venue`;
    
    const response = await fetch(s2Url);
    
    if (!response.ok) {
      throw new Error("Gagal mengambil data dari Semantic Scholar API");
    }

    const data = await response.json();
    
    // Format ulang data agar sesuai dengan struktur frontend yang kita buat tadi
    const formattedResults = (data.data || []).map((paper: any) => {
      const authorNames = paper.authors && paper.authors.length > 0 
        ? paper.authors.map((a: any) => a.name).join(', ') 
        : 'Penulis Tidak Diketahui';

      return {
        judul: paper.title,
        tahun: paper.year || 'N/A',
        penulis: authorNames,
        sumber: paper.venue || 'Jurnal Internasional', // venue biasanya berisi nama jurnal/konferensi
        link: paper.url || '#'
      };
    });

    return NextResponse.json({ results: formattedResults });

  } catch (error: any) {
    console.error('Error cari jurnal:', error);
    return NextResponse.json({ error: `Gagal mencari jurnal: ${error.message}` }, { status: 500 });
  }
}