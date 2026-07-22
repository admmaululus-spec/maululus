// app/api/cari-jurnal/route.ts
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
      { 
        cookies: { get(name: string) { return cookieStore.get(name)?.value; } } 
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const { query } = await req.json();

    if (!query) return NextResponse.json({ error: 'Query pencarian tidak boleh kosong' }, { status: 400 });

    // Simpan history pencarian
    await supabase.from('ai_tools_history').insert({ 
      user_id: userId, 
      tool_name: 'Cari Jurnal', 
      input_data: `Query: ${String(query).substring(0, 30)}...` 
    });

    const rawQuery = String(query).substring(0, 150);
    const searchKeyword = rawQuery.replace(/(analisis|pengaruh|implementasi|terhadap|dengan|berbasis|untuk|dan|di|pada|studi|kasus)/gi, '').trim();
    const finalQuery = searchKeyword || rawQuery;

    const limit = 5;
    
    // MENGGUNAKAN CROSSREF API (Gratis, Tanpa API Key, Jurnal Asli)
    // Parameter mailto digunakan sebagai etiket (politeness) agar server Crossref tidak memblokir request kita
    const crossrefUrl = `https://api.crossref.org/works?query=${encodeURIComponent(finalQuery)}&select=title,author,issued,URL,container-title&rows=${limit}&mailto=admin@maululus.id`;
    
    const response = await fetch(crossrefUrl, {
      headers: {
        'User-Agent': 'Maululus-App/1.0 (mailto:admin@maululus.id)',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Crossref API Error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    const items = data.message.items || [];
    
    // Memformat hasil dari Crossref agar sesuai dengan desain frontend Anda
    const formattedResults = items.map((paper: any) => {
      // Susun nama penulis
      let authorNames = 'Penulis Tidak Diketahui';
      if (paper.author && paper.author.length > 0) {
        authorNames = paper.author.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()).join(', ');
      }

      // Ambil tahun terbit
      let year = 'N/A';
      if (paper.issued && paper.issued['date-parts'] && paper.issued['date-parts'][0]) {
        year = paper.issued['date-parts'][0][0]; // Array format: [[YYYY, MM, DD]]
      }

      return { 
        judul: paper.title && paper.title.length > 0 ? paper.title[0] : 'Judul Tidak Tersedia', 
        tahun: year, 
        penulis: authorNames, 
        sumber: paper['container-title'] && paper['container-title'].length > 0 ? paper['container-title'][0] : 'Jurnal Akademik', 
        link: paper.URL || '#' 
      };
    });

    return NextResponse.json({ results: formattedResults });

  } catch (error: any) {
    console.error("Error API Cari Jurnal:", error);
    return NextResponse.json({ error: `Gagal mencari jurnal: ${error.message}` }, { status: 500 });
  }
}