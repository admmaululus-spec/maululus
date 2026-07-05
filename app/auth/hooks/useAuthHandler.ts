import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

export function useAuthHandler() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // States Form
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false); 
  
  // States Loading & Notifikasi
  const [isLoading, setIsLoading] = useState(true); 
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // States Resend Email
  const [showResend, setShowResend] = useState(false);
  const [resendEmailTarget, setResendEmailTarget] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
      } else {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [router]);

  // Routing Cerdas berdasarkan Role
  const routeUserBasedOnRole = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle(); 

    if (error) console.error("Gagal mengambil profil:", error);

    const role = profile?.role?.toLowerCase();
    if (role === 'admin') router.replace('/admin'); 
    else if (role === 'analyst' || role === 'analis') router.replace('/admin/analis');
    else router.replace('/dashboard');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg(''); setSuccessMsg(''); setShowResend(false);
    let isNavigating = false;

    try {
      if (isLogin) {
        const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setShowResend(true); setResendEmailTarget(email);
            throw new Error('Email belum dikonfirmasi. Silakan cek kotak masuk/spam email Anda.');
          }
          throw error;
        }
        if (authData.session) {
          isNavigating = true;
          await routeUserBasedOnRole(authData.session.user.id);
        }
      } else {
        if (password !== confirmPassword) throw new Error('Password dan Konfirmasi Password tidak cocok!');
        if (!whatsapp.startsWith('08') && !whatsapp.startsWith('62')) throw new Error('Nomor WhatsApp tidak valid (Gunakan awalan 08... atau 62...)');

        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { whatsapp } } });
        if (error) throw error;

        if (data.session) {
          isNavigating = true;
          await routeUserBasedOnRole(data.session.user.id);
          return;
        }
        
        setSuccessMsg('Pendaftaran berhasil! Silakan cek Email Anda untuk mengaktifkan akun.');
        setIsLogin(true); setShowResend(true); setResendEmailTarget(email);
        setPassword(''); setConfirmPassword(''); setWhatsapp('');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Terjadi kesalahan saat autentikasi.');
    } finally {
      if (!isNavigating) setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!resendEmailTarget) return;
    setIsLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: resendEmailTarget });
      if (error) throw error;
      setSuccessMsg(`Email konfirmasi telah dikirim ulang ke ${resendEmailTarget}.`);
      setShowResend(false); 
    } catch (error: any) {
      setErrorMsg(error.message || 'Gagal mengirim ulang email. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    let isNavigating = false;
    try {
      setIsLoading(true); setErrorMsg('');
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });
      if (error) throw error;
      if (data.session) {
        isNavigating = true;
        await routeUserBasedOnRole(data.session.user.id);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Gagal masuk dengan Google.');
    } finally {
      if (!isNavigating) setIsLoading(false);
    }
  };

  return {
    isLogin, setIsLogin,
    email, setEmail,
    whatsapp, setWhatsapp,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    isLoading, errorMsg, setErrorMsg, successMsg, setSuccessMsg,
    showResend, setShowResend,
    handleAuth, handleResendEmail, handleGoogleSuccess
  };
}