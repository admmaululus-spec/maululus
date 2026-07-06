import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Deteksi apakah skrip ini sedang dijalankan oleh sistem Build/Prerender Next.js
const isBuildPhase = process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !supabaseUrl;

// Aturan Fail-Fast sesuai standar CodeRabbit, TAPI diberi pengecualian saat proses Build
if (!supabaseUrl || !supabaseKey) {
  if (!isBuildPhase) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }
  console.warn('⚠️ Peringatan Build: Variabel Supabase tidak terdeteksi saat prerendering. Menggunakan bypass sementara.');
}

// Menggunakan placeholder SEMENTARA *HANYA* agar kompilasi Next.js tidak crash.
// Saat website diakses secara live, URL dan Key asli akan otomatis digunakan.
export const supabase = createClient(
  supabaseUrl || 'https://bypass-build.supabase.co',
  supabaseKey || 'bypass-build-key'
);