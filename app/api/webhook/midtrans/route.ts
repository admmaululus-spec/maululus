import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. BARIS WAJIB UNTUK CLOUDFLARE PAGES / EDGE RUNTIME
export const runtime = 'edge';

// Inisialisasi Supabase menggunakan Service Role Key (Wajib agar bisa menembus RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

// 2. FUNGSI HASH SHA-512 UNTUK EDGE RUNTIME (Pengganti modul Node.js 'crypto')
async function generateSHA512(data: string) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      custom_field1, // Berisi ID User (dari API Payment)
      custom_field2  // Berisi Nama Paket (dari API Payment)
    } = body;

    // Verifikasi Keamanan Signature Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    
    // Gunakan fungsi Web Crypto API yang kompatibel dengan Edge Runtime
    const hashInput = order_id + status_code + gross_amount + serverKey;
    const hash = await generateSHA512(hashInput);

    if (hash !== signature_key) {
      console.error('Invalid signature from Midtrans');
      return NextResponse.json({ error: 'Akses Ditolak: Signature tidak valid' }, { status: 403 });
    }

    // Cek apakah status pembayaran sukses (settlement atau capture yang di-accept)
    if (transaction_status === 'settlement' || (transaction_status === 'capture' && fraud_status === 'accept')) {
      
      if (!custom_field1) {
        throw new Error('custom_field1 (user_id) tidak ditemukan pada payload Midtrans');
      }

      // ==============================================================
      // LOGIKA 1: PEMBELIAN PAKET EXPERT (Contoh: Pro Scholar)
      // ==============================================================
      if (custom_field2 === 'Pro Scholar') {
        const { error } = await supabase
          .from('users_data')
          .update({ 
            is_pro: true, 
            koin: 11 // Bonus koin khusus pro scholar
          })
          .eq('id', custom_field1);

        if (error) {
          console.error("Gagal update DB Supabase:", error);
          throw error;
        }
        console.log(`Berhasil memperbarui akun PRO untuk user: ${custom_field1}`);
      } 
      
      // ==============================================================
      // LOGIKA 2: PEMBELIAN TOP UP KOIN BIASA
      // ==============================================================
      else {
        // A. Ambil informasi paket dari database untuk tahu berapa koin yang didapat
        const { data: coinPkg } = await supabase
          .from('coin_packages')
          .select('koin') 
          .eq('nama', custom_field2)
          .single();
        
        // B. Ambil total koin dari tabel. 
        // Fallback: Jika paket terhapus saat user bayar, pakai rumus Rp 1000 = 1 koin
        const totalKoinDidapat = coinPkg ? coinPkg.koin : Math.floor(parseInt(gross_amount) / 1000);

        // C. Ambil sisa koin user saat ini di tabel profiles
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('koin')
          .eq('id', custom_field1)
          .single();

        const sisaKoin = currentProfile?.koin || 0;

        // D. Tambahkan koin dan update ke tabel profiles
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ koin: sisaKoin + totalKoinDidapat })
          .eq('id', custom_field1);

        if (updateError) {
          console.error("Gagal top up koin ke profiles:", updateError);
          throw updateError;
        }
        
        console.log(`Berhasil Topup ${totalKoinDidapat} koin untuk user: ${custom_field1}`);
      }
    }

    // Return 200 OK agar Midtrans tahu webhook sudah sukses diproses
    return NextResponse.json({ message: 'OK' }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    // Kita tetap kirim 500 ke Midtrans jika error agar Midtrans mengirim ulang webhook nanti
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}