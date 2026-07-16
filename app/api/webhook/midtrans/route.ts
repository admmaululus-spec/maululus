// app/api/webhook/midtrans/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transaction_status, order_id, gross_amount, status_code, signature_key, custom_field1, custom_field2, payment_type, customer_details } = body;

    // 🔴 1. VERIFIKASI SIGNATURE MENGGUNAKAN WEB CRYPTO API (EDGE COMPATIBLE)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const inputString = order_id + status_code + gross_amount + serverKey;
    
    // Proses Hashing SHA-512 khusus untuk Edge Runtime
    const encoder = new TextEncoder();
    const data = encoder.encode(inputString);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hash !== signature_key) {
      console.error("Akses Webhook Ditolak: Signature Tidak Valid!");
      return NextResponse.json({ message: 'Invalid Signature' }, { status: 403 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      const userId = custom_field1;
      const paketNama = custom_field2;
      const userEmail = customer_details?.email || 'Dari Midtrans';

      if (!userId || !paketNama) {
        return NextResponse.json({ message: 'Data custom_field tidak lengkap' }, { status: 400 });
      }

      const { data: pkg } = await supabaseAdmin.from('coin_packages').select('koin').eq('nama', paketNama).single();
      const koinDidapat = pkg?.koin || 0;

      if (koinDidapat > 0) {
        const { data: userData } = await supabaseAdmin.from('users_data').select('koin').eq('id', userId).single();
        const currentKoin = userData?.koin || 0;

        await supabaseAdmin.from('users_data').update({ koin: currentKoin + koinDidapat }).eq('id', userId);

        await supabaseAdmin.from('transactions').insert({
          user_id: userId,
          user_email: userEmail,
          paket_nama: paketNama,
          koin_jumlah: koinDidapat,
          harga_rp: parseInt(gross_amount),
          metode: payment_type,
          status: 'SUCCESS'
        });
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}