'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push('/');
    } catch (err: any) {
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        setUserEmail(formData.email);
        setShowUnverifiedModal(true);
        setError('');
      } else {
        setError(err.message || 'Login fehlgeschlagen');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <section className="flex-grow flex items-center justify-center pt-20 md:pt-24 pb-12 md:pb-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-semibold mb-2 tracking-tight text-slate-900">
                Anmelden
              </h1>
              <p className="text-sm md:text-base text-slate-600 mb-6 font-light">
                Melden Sie sich in Ihrem Konto an
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div>
                  <label htmlFor="email" className="block text-xs md:text-sm font-medium text-slate-900 mb-2">
                    E-Mail-Adresse *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all text-sm"
                    placeholder="ihre@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs md:text-sm font-medium text-slate-900 mb-2">
                    Passwort *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {loading ? 'Wird angemeldet...' : 'Anmelden'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs md:text-sm text-slate-600">
                  Noch kein Konto?{' '}
                  <Link href="/register" className="text-slate-900 font-medium hover:underline">
                    Jetzt registrieren
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Not Verified Modal */}
      {showUnverifiedModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold mb-3 text-slate-900">
                E-Mail noch nicht bestätigt
              </h2>
              <div className="text-left mb-6 space-y-3">
                <p className="text-sm md:text-base text-slate-700">
                  Ihre E-Mail-Adresse <strong className="text-slate-900">{userEmail}</strong> wurde noch nicht bestätigt.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-slate-700 mb-2">
                    <strong className="text-slate-900">Bitte überprüfen Sie Ihr Postfach</strong> und klicken Sie auf den Bestätigungslink in der E-Mail, die wir Ihnen gesendet haben.
                  </p>
                  <p className="text-xs text-slate-600">
                    Nach der Bestätigung können Sie sich anmelden.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowUnverifiedModal(false);
                  setFormData({ email: formData.email, password: '' });
                }}
                className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
              >
                Verstanden
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

