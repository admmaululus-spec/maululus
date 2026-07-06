import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'edge';

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

    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query pencarian tidak boleh kosong' }, { status: 400 });
    }

    // Batasi input untuk keamanan dan efisiensi API
    const rawQuery = String(query).substring(0, 150);
    const searchKeyword = rawQuery.replace(/(analisis|pengaruh|implementasi|terhadap|dengan|berbasis|untuk|dan|di|pada|studi|kasus)/gi, '').trim();
    
    // Cegah query kosong setelah difilter regex
    if (!searchKeyword) {
      return NextResponse.json({ error: 'Gunakan kata kunci jurnal yang lebih spesifik' }, { status: 400 });
    }

    const limit = 5;
    const s2Url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(searchKeyword)}&limit=${limit}&fields=title,authors,year,url,venue`;
    
    const response = await fetch(s2Url);
    
    if (!response.ok) {
      throw new Error("Gagal mengambil data dari Semantic Scholar API");
    }

    const data = await response.json();
    
    const formattedResults = (data.data || []).map((paper: any) => {
      const authorNames = paper.authors && paper.authors.length > 0 
        ? paper.authors.map((a: any) => a.name).join(', ') 
        : 'Penulis Tidak Diketahui';

      return {
        judul: paper.title,
        tahun: paper.year || 'N/A',
        penulis: authorNames,
        sumber: paper.venue || 'Jurnal Internasional',
        link: paper.url || '#'
      };
    });

    return NextResponse.json({ results: formattedResults });

  } catch (error: any) {
    console.error('Error cari jurnal:', error);
    return NextResponse.json({ error: `Gagal mencari jurnal: ${error.message}` }, { status: 500 });
  }
}