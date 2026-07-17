// app/api/trigger-notif/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    // Gunakan Service Role agar bisa membaca semua rules & log
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    // 1. Ambil data koin user saat ini
    const { data: user } = await supabaseAdmin.from('users_data').select('koin').eq('id', userId).single();
    if (!user) return NextResponse.json({ status: 'User not found' });

    // 2. Ambil semua aturan (rules) yang aktif
    const { data: rules } = await supabaseAdmin.from('notification_rules').select('*').eq('is_active', true);
    if (!rules || rules.length === 0) return NextResponse.json({ status: 'No active rules' });

    // 3. Evaluasi setiap aturan
    for (const rule of rules) {
      let isConditionMet = false;

      // Logika Kondisi (Bisa Anda tambah kondisinya di masa depan)
      if (rule.kondisi === 'koin_kurang_dari' && user.koin <= rule.nilai_kondisi) {
        isConditionMet = true;
      } else if (rule.kondisi === 'koin_habis' && user.koin === 0) {
        isConditionMet = true;
      }

      if (isConditionMet) {
        // 4. Cek apakah user sedang dalam masa "Cooldown" untuk rule ini
        const cooldownDate = new Date();
        cooldownDate.setDate(cooldownDate.getDate() - rule.cooldown_hari);

        const { data: recentLog } = await supabaseAdmin
          .from('notification_logs')
          .select('id')
          .eq('user_id', userId)
          .eq('rule_id', rule.id)
          .gte('created_at', cooldownDate.toISOString())
          .limit(1);

        // Jika belum ada notif yang dikirim dalam masa cooldown, KIRIM NOTIF!
        if (!recentLog || recentLog.length === 0) {
          // Kirim Notifikasi
          await supabaseAdmin.from('notifications').insert({
            user_id: userId,
            title: rule.title,
            message: rule.message,
            icon: rule.icon,
          });

          // Catat di Log agar tidak spam
          await supabaseAdmin.from('notification_logs').insert({
            user_id: userId,
            rule_id: rule.id
          });
        }
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}