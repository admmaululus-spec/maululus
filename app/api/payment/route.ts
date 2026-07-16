// app/api/payment/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'edge';

// Sesuaikan dengan nilai konversi koin Anda
const NILAI_TUKAR_KOIN = 5000; 

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );
    
    // Ambil session dan ID User
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;

    const body = await req.json();
    // Tangkap koin_dipakai (default 0 jika tidak ada)
    const { order_id, first_name, email, phone, item_name, koin_dipakai = 0 } = body;

    if (!order_id || !first_name || !email || !item_name) {
      return NextResponse.json({ error: 'Data pembayaran tidak lengkap' }, { status: 400 });
    }

    // 1. Ambil harga dari database
    let originalPrice = 0;
    const { data: coinPkg } = await supabase.from('coin_packages').select('harga').eq('nama', item_name).maybeSingle();
    
    if (coinPkg) {
      originalPrice = coinPkg.harga;
    } else {
      const { data: expertPkg } = await supabase.from('expert_packages').select('harga').eq('nama', item_name).maybeSingle();
      if (expertPkg) originalPrice = expertPkg.harga;
    }

    if (originalPrice <= 0) {
      return NextResponse.json({ error: 'Paket tidak valid atau tidak ditemukan' }, { status: 400 });
    }

    // ==========================================
    // 2. VALIDASI DISKON KOIN SECARA AMAN
    // ==========================================
    let totalDiskon = 0;
    let validKoinDipakai = 0;

    if (koin_dipakai > 0) {
      // Cek koin asli di database agar user tidak bisa hack dari inspect element
      const { data: userData } = await supabase.from('users_data').select('koin').eq('id', userId).single();
      const koinTersedia = userData?.koin || 0;

      if (koinTersedia >= koin_dipakai) {
         validKoinDipakai = koin_dipakai;
         totalDiskon = validKoinDipakai * NILAI_TUKAR_KOIN;
      } else {
         return NextResponse.json({ error: 'Koin Anda tidak cukup untuk diskon ini.' }, { status: 400 });
      }
    }

    const finalGrossAmount = originalPrice - totalDiskon;

    // Pastikan harga akhir tidak minus (jika diskon koin lebih besar dari harga paket)
    if (finalGrossAmount <= 0) {
      return NextResponse.json({ error: 'Diskon melebihi harga paket' }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json({ error: 'Konfigurasi Server Midtrans belum lengkap.' }, { status: 500 });
    }
    
    const base64Key = btoa(serverKey + ':');

    // 3. SUSUN ITEM DETAILS UNTUK MIDTRANS
    const item_details: any[] = [{
      id: String(order_id).substring(0, 50),
      price: Math.round(originalPrice),
      quantity: 1,
      name: String(item_name).substring(0, 50)
    }];

    // Jika ada diskon, masukkan sebagai item dengan harga Minus (-)
    if (totalDiskon > 0) {
      item_details.push({
        id: 'DISKON-KOIN',
        price: -Math.round(totalDiskon),
        quantity: 1,
        name: `Diskon Koin (${validKoinDipakai} Koin)`
      });
    }

    const payload = {
      transaction_details: {
        order_id: order_id,
        gross_amount: Math.round(finalGrossAmount), // Harus seimbang dengan total item_details
      },
      customer_details: {
        first_name: String(first_name).substring(0, 50),
        email: String(email).substring(0, 50),
        phone: phone ? String(phone).substring(0, 20) : '',
      },
      item_details: item_details,
      
      custom_field1: userId,
      custom_field2: String(item_name).substring(0, 50),
      custom_field3: String(validKoinDipakai) // Titipkan data koin ke Webhook
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