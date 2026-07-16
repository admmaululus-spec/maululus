// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // 1. Mencegah user yang sudah login untuk kembali ke halaman Auth/Login
  if (path.startsWith('/auth') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Proteksi Halaman Dashboard User
  if (path.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // 3. Proteksi Halaman Admin & Analis
  if (path.startsWith('/admin') || path.startsWith('/analis') || path.startsWith('/analyst')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role?.toLowerCase() || 'user';

    if (path.includes('/analis') || path.includes('/analyst')) {
      if (role !== 'admin' && role !== 'analyst' && role !== 'analis') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } else {
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  // Pengecualian endpoint Publik seperti api/generate-judul agar tidak kena block
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};