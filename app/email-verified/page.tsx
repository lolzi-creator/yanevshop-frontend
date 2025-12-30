'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

function EmailVerifiedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get tokens from URL hash (Supabase redirects with hash)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');

        if (errorParam) {
          setError(errorDescription || errorParam);
          setLoading(false);
          return;
        }

        if (accessToken && refreshToken) {
          // Store tokens
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);

          // Refresh user data to get updated email verification status
          await refreshUser();

          // Clean URL
          window.history.replaceState({}, '', '/email-verified');

          setLoading(false);
        } else {
          // No tokens in hash - maybe user already verified or came here directly
          setLoading(false);
        }
      } catch (error: any) {
        console.error('Email verification error:', error);
        setError(error.message || 'Fehler bei der Bestätigung');
        setLoading(false);
      }
    };

    handleEmailVerification();
  }, [refreshUser]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20 md:pt-24">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            <p className="text-slate-600">E-Mail wird bestätigt...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20 md:pt-24 pb-12 md:pb-16">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-slate-900">Fehler</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Zum Login
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center pt-20 md:pt-24 pb-12 md:pb-16">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-slate-900">
            E-Mail erfolgreich bestätigt!
          </h1>
          <p className="text-slate-600 mb-6">
            Ihr Konto wurde aktiviert. Sie können sich jetzt anmelden.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Jetzt anmelden
            </Link>
            <Link
              href="/"
              className="inline-block px-6 py-3 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function EmailVerifiedPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-white items-center justify-center">
        <Navbar />
        <div className="flex-grow text-center max-w-md mx-auto px-4 py-20">
          <p className="text-slate-600">Lädt...</p>
        </div>
        <Footer />
      </div>
    }>
      <EmailVerifiedContent />
    </Suspense>
  );
}

