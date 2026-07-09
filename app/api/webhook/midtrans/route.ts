import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. BARIS WAJIB UNTUK CLOUDFLARE PAGES / EDGE RUNTIME
export const runtime = 'edge';

// Inisialisasi Supabase menggunakan Service Role Key (Wajib agar bisa menembus RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

// 2. FUNGSI HASH SHA-512 UNTUK EDGE RUNTIME
async function generateSHA512(data: string) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// 3. FUNGSI GET: Agar URL tidak 404 saat kamu klik / cek manual di Browser
export async function GET() {
  return NextResponse.json(
    { status: 'success', message: 'Webhook Midtrans Maululus Aktif dan Standby.' },
    { status: 200 }
  );
}

// 4. FUNGSI POST: Untuk menerima data dari Midtrans
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // --- TANGKAP "TEST PING" DARI DASHBOARD MIDTRANS ---
    // Midtrans biasanya mengirim payload tanpa order_id atau data dummy saat tombol "Simpan" ditekan
    if (!body.order_id || body.order_id === 'test') {
      console.log('Menerima Test Ping dari Midtrans');
      return NextResponse.json({ message: 'Ping Diterima' }, { status: 200 });
    }

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      custom_field1, // Berisi ID User 
      custom_field2  // Berisi Nama Paket 
    } = body;

    // Verifikasi Keamanan Signature Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const hashInput = order_id + status_code + gross_amount + serverKey;
    const hash = await generateSHA512(hashInput);

    if (hash !== signature_key) {
      console.error('Invalid signature from Midtrans');
      // Tetap kembalikan 200 agar Midtrans tidak mengulang-ulang pengiriman (spam)
      return NextResponse.json({ error: 'Signature tidak valid' }, { status: 200 });
    }

    // Cek apakah status pembayaran sukses (settlement atau capture yang di-accept)
    if (transaction_status === 'settlement' || (transaction_status === 'capture' && fraud_status === 'accept')) {
      
      // Jika custom_field1 tidak ada (mungkin karena kelupaan di-inject saat API /payment)
      if (!custom_field1) {
        console.error(`Transaksi sukses (Order ID: ${order_id}), tapi custom_field1 (User ID) kosong.`);
        return NextResponse.json({ message: 'OK, tapi User ID kosong' }, { status: 200 });
      }

      // ==============================================================
      // LOGIKA 1: PEMBELIAN PAKET EXPERT (Contoh: Pro Scholar)
      // ==============================================================
      if (custom_field2 === 'Pro Scholar') {
        const { error } = await supabase
          .from('users_data')
          .update({ 
            is_pro: true, 
            koin: 11 
          })
          .eq('id', custom_field1);

        if (error) throw error;
        console.log(`Berhasil memperbarui akun PRO untuk user: ${custom_field1}`);
      } 
      
      // ==============================================================
      // LOGIKA 2: PEMBELIAN TOP UP KOIN BIASA
      // ==============================================================
      else {
        const { data: coinPkg } = await supabase
          .from('coin_packages')
          .select('koin') 
          .eq('nama', custom_field2)
          .single();
        
        const totalKoinDidapat = coinPkg ? coinPkg.koin : Math.floor(parseInt(gross_amount) / 1000);

        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('koin')
          .eq('id', custom_field1)
          .single();

        const sisaKoin = currentProfile?.koin || 0;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ koin: sisaKoin + totalKoinDidapat })
          .eq('id', custom_field1);

        if (updateError) throw updateError;
        
        console.log(`Berhasil Topup ${totalKoinDidapat} koin untuk user: ${custom_field1}`);
      }
    }

    // WAJIB: Selalu return 200 OK di akhir proses
    return NextResponse.json({ message: 'Data berhasil diproses' }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    // Meskipun terjadi error internal (misal DB mati), kembalikan 200 OK ke Midtrans agar tidak ditandai sebagai URL rusak
    return NextResponse.json({ message: 'Terjadi kesalahan internal, tapi webhook diterima' }, { status: 200 });
  }
}