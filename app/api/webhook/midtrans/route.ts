import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. BARIS WAJIB UNTUK CLOUDFLARE PAGES
export const runtime = 'edge';

// Inisialisasi Supabase menggunakan Service Role Key
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
      custom_field1, // ID User
      custom_field2  // Nama Paket
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

    // Cek status 
    if (transaction_status === 'settlement' || (transaction_status === 'capture' && fraud_status === 'accept')) {
      
      if (!custom_field1) {
        throw new Error('custom_field1 (user_id) tidak ditemukan pada payload Midtrans');
      }

      // Update Database
      if (custom_field2 === 'Pro Scholar') {
        const { error } = await supabase
          .from('users_data')
          .update({ 
            is_pro: true, 
            koin: 11 
          })
          .eq('id', custom_field1);

        if (error) {
          console.error("Gagal update DB Supabase:", error);
          throw error;
        }
        console.log(`Berhasil memperbarui akun PRO untuk user: ${custom_field1}`);
      }
    }

    // Return 200 OK 
    return NextResponse.json({ message: 'OK' }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
