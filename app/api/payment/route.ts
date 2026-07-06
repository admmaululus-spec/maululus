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

    const body = await req.json();
    const { order_id, first_name, email, phone, item_name } = body;

    // 1. Validasi input dasar
    if (!order_id || !first_name || !email || !item_name) {
      return NextResponse.json({ error: 'Data pembayaran tidak lengkap' }, { status: 400 });
    }

    // 2. Ambil harga dari database (jangan percaya input klien)
    let validGrossAmount = 0;
    const { data: coinPkg } = await supabase.from('coin_packages').select('harga').eq('nama', item_name).single();
    
    if (coinPkg) {
      validGrossAmount = coinPkg.harga;
    } else {
      const { data: expertPkg } = await supabase.from('expert_packages').select('harga').eq('nama', item_name).single();
      if (expertPkg) validGrossAmount = expertPkg.harga;
    }

    if (validGrossAmount <= 0) {
      return NextResponse.json({ error: 'Paket tidak valid atau tidak ditemukan' }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY belum diatur!");
      return NextResponse.json({ error: 'Konfigurasi Server Midtrans belum lengkap.' }, { status: 500 });
    }
    
    const base64Key = btoa(serverKey + ':');

    const payload = {
      transaction_details: {
        order_id: order_id,
        gross_amount: Math.round(validGrossAmount),
      },
      customer_details: {
        first_name: String(first_name).substring(0, 50),
        email: String(email).substring(0, 50),
        phone: phone ? String(phone).substring(0, 20) : '',
      },
      item_details: [{
        id: String(order_id).substring(0, 50),
        price: Math.round(validGrossAmount),
        quantity: 1,
        name: String(item_name).substring(0, 50)
      }]
    };

    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${base64Key}`,
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error_messages ? data.error_messages[0] : 'Gagal memanggil API Midtrans');
    }

    return NextResponse.json({ token: data.token });
  } catch (error: any) {
    console.error("Error Payment Route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}