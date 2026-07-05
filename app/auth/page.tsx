'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthForm from './components/AuthForm';

export default function AuthPage() {
  // Mengambil Google Client ID langsung dari environment variable
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;

  if (!GOOGLE_CLIENT_ID) {
    console.warn("Peringatan: NEXT_PUBLIC_GOOGLE_CLIENT_ID belum terdeteksi. Pastikan file .env.local sudah benar dan server telah di-restart.");
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthForm />
    </GoogleOAuthProvider>
  );
}