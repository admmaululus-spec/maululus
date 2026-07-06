import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // 1. Setup response & cookie handling standar terbaru @supabase/ssr
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. VALIDASI KEAMANAN KRITIS: Gunakan getUser(), JANGAN getSession()
  // Ini memastikan token divalidasi langsung ke server Supabase
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 3. Mencegah user yang sudah login untuk kembali ke halaman Auth/Login
  if (path.startsWith('/auth') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 4. Proteksi Halaman Dashboard
  if (path.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // 5. Proteksi Halaman Admin & Pembagian Role
  if (path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // Ambil data profile dari DB secara real-time
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role?.toLowerCase() || 'user';

    // Pengecekan Khusus Halaman Analis
    if (path.startsWith('/admin/analis')) {
      // Yang boleh masuk ke /admin/analis adalah Admin atau Analis
      if (role !== 'admin' && role !== 'analyst' && role !== 'analis') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } else {
      // Untuk sisa halaman /admin/* lainnya, HANYA ADMIN yang boleh masuk!
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  // PENTING: Gunakan matcher regex ini. 
  // Ini akan menjalankan middleware di SEMUA halaman kecuali file statis (gambar, css, next/static).
  // Jauh lebih aman karena jika besok kamu membuat folder /super-admin, dia otomatis terproteksi.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};