// app/api/webhook/midtrans/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transaction_status, order_id, gross_amount, custom_field1, custom_field2, payment_type, customer_details } = body;

    // 🔴 SANGAT PENTING: Gunakan SERVICE_ROLE_KEY (Bukan ANON_KEY)
    // Karena request datang dari server Midtrans (tanpa cookie user), kita harus menggunakan kunci Admin agar tidak diblokir database
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    // Midtrans akan mengirim status 'settlement' atau 'capture' jika user BERHASIL bayar
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      const userId = custom_field1;
      const paketNama = custom_field2;
      const userEmail = customer_details?.email || 'Dari Midtrans';

      if (!userId || !paketNama) {
        return NextResponse.json({ message: 'Data custom_field tidak lengkap' }, { status: 400 });
      }

      // 1. Ambil jumlah koin yang harus ditambahkan dari paket yang dibeli
      const { data: pkg } = await supabaseAdmin
        .from('coin_packages')
        .select('koin')
        .eq('nama', paketNama)
        .single();
        
      const koinDidapat = pkg?.koin || 0;

      if (koinDidapat > 0) {
        // 2. Ambil koin user saat ini
        const { data: userData } = await supabaseAdmin
          .from('users_data')
          .select('koin')
          .eq('id', userId)
          .single();
          
        const currentKoin = userData?.koin || 0;

        // 3. Eksekusi penambahan koin ke akun user
        await supabaseAdmin
          .from('users_data')
          .update({ koin: currentKoin + koinDidapat })
          .eq('id', userId);

        // 4. Catat riwayat di tabel transactions agar muncul di dashboard admin & user
        await supabaseAdmin.from('transactions').insert({
          user_id: userId,
          user_email: userEmail,
          paket_nama: paketNama,
          koin_jumlah: koinDidapat,
          harga_rp: parseInt(gross_amount),
          metode: payment_type,
          status: 'SUCCESS' // Atau order_id
        });
      }
    }

    // Selalu kembalikan respon 200 OK agar Midtrans berhenti mengirim notifikasi berulang
    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}