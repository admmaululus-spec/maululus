// app/api/turnitin/route.ts
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

    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: 'Teks dokumen kosong' }, { status: 400 });

    const COPYLEAKS_EMAIL = process.env.COPYLEAKS_EMAIL;
    const COPYLEAKS_API_KEY = process.env.COPYLEAKS_API_KEY;

    if (!COPYLEAKS_EMAIL || !COPYLEAKS_API_KEY) {
      return NextResponse.json({ error: 'Konfigurasi Copyleaks API belum diatur di server' }, { status: 500 });
    }

    // 1. Autentikasi: Dapatkan Access Token dari Copyleaks
    const loginRes = await fetch('https://id.copyleaks.com/v3/account/login/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: COPYLEAKS_EMAIL,
        key: COPYLEAKS_API_KEY
      })
    });

    if (!loginRes.ok) {
      throw new Error("Gagal login ke server Copyleaks");
    }

    const loginData = await loginRes.json();
    const accessToken = loginData.access_token;

    // 2. Proses Pengiriman Dokumen ke Copyleaks
    const scanId = `maululus_${Date.now()}`;
    
    const submitRes = await fetch(`https://api.copyleaks.com/v3/education/submit/text/${scanId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        base64: Buffer.from(text).toString('base64'),
        properties: {
          sandbox: true, // Ubah ke 'false' jika sudah siap memotong saldo Copyleaks asli
          webhooks: {
             status: `https://maululus.id/api/webhook/copyleaks/{status}/${scanId}` 
          }
        }
      })
    });

    if (!submitRes.ok) {
        throw new Error("Gagal mengirim dokumen ke pemindai Copyleaks");
    }

    return NextResponse.json({ 
        result: {
            score: 0, 
            matches: []
        },
        message: "Dokumen berhasil dikirim ke Copyleaks. Menunggu Webhook."
    });

  } catch (error: any) {
    console.error("Error Copyleaks API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}