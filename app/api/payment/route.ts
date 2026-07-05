import { NextResponse } from 'next/server';


export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, gross_amount, first_name, email, phone, item_name } = body;

    // Ambil Server Key dari Environment Variable
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    
    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY belum diatur!");
      return NextResponse.json({ error: 'Konfigurasi Server Midtrans belum lengkap.' }, { status: 500 });
    }
    
    // 2. UBAH CARA ENCODE BASE64 KHUSUS UNTUK EDGE RUNTIME
    // Di Edge Runtime (Cloudflare), kita tidak bisa pakai Buffer. Kita pakai fungsi btoa() bawaan browser.
    const base64Key = btoa(serverKey + ':');

    const payload = {
      transaction_details: {
        order_id: order_id,
        gross_amount: Math.round(gross_amount), // Harus bilangan bulat
      },
      customer_details: {
        first_name: first_name,
        email: email,
        phone: phone,
      },
      item_details: [{
        id: order_id,
        price: Math.round(gross_amount),
        quantity: 1,
        name: item_name
      }]
    };

    // Ganti URL ke app.midtrans.com jika nanti sudah rilis ke Production
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