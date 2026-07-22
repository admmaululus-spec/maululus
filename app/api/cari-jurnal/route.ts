// app/api/cari-jurnal/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// WAJIB ADA UNTUK CLOUDFLARE PAGES
export const runtime = 'edge'; 

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
      { 
        cookies: { get(name: string) { return cookieStore.get(name)?.value; } } 
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const { query } = await req.json();

    if (!query) return NextResponse.json({ error: 'Query pencarian tidak boleh kosong' }, { status: 400 });

    /* 
       LOGIKA PEMOTONGAN KOIN TETAP DIHAPUS DARI SINI
       Untuk mencegah Double Charge, karena koin sudah dipotong di frontend.
    */

    // Simpan ke history
    await supabase.from('ai_tools_history').insert({ 
      user_id: userId, 
      tool_name: 'Cari Jurnal', 
      input_data: `Query: ${String(query).substring(0, 30)}...` 
    });

    const rawQuery = String(query).substring(0, 150);
    const searchKeyword = rawQuery.replace(/(analisis|pengaruh|implementasi|terhadap|dengan|berbasis|untuk|dan|di|pada|studi|kasus)/gi, '').trim();
    
    // Jika setelah difilter kata kunci jadi kosong, gunakan rawQuery aslinya agar API tidak error
    const finalQuery = searchKeyword || rawQuery;

    const limit = 5;
    const s2Url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(finalQuery)}&limit=${limit}&fields=title,authors,year,url,venue`;
    
    // Tambahkan User-Agent dan Accept headers agar tidak diblokir oleh Semantic Scholar
    const response = await fetch(s2Url, {
      headers: {
        'User-Agent': 'Maululus-App/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Semantic Scholar API Error (${response.status}): ${errorText}`);
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
    console.error("Error API Cari Jurnal:", error);
    return NextResponse.json({ error: `Gagal mencari jurnal: ${error.message}` }, { status: 500 });
  }
}