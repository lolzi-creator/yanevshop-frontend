'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    if (formData.password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.fullName || undefined,
        formData.phone || undefined
      );
      setShowVerificationModal(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
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
                Registrieren
              </h1>
              <p className="text-sm md:text-base text-slate-600 mb-6 font-light">
                Erstellen Sie ein neues Konto
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div>
                  <label htmlFor="fullName" className="block text-xs md:text-sm font-medium text-slate-900 mb-2">
                    Vollständiger Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all text-sm"
                    placeholder="Max Mustermann"
                  />
                </div>

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
                  <label htmlFor="phone" className="block text-xs md:text-sm font-medium text-slate-900 mb-2">
                    Telefonnummer
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all text-sm"
                    placeholder="+41 44 123 45 67"
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
                    placeholder="Mindestens 6 Zeichen"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs md:text-sm font-medium text-slate-900 mb-2">
                    Passwort bestätigen *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all text-sm"
                    placeholder="Passwort wiederholen"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {loading ? 'Wird registriert...' : 'Registrieren'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs md:text-sm text-slate-600">
                  Bereits ein Konto?{' '}
                  <Link href="/login" className="text-slate-900 font-medium hover:underline">
                    Jetzt anmelden
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold mb-3 text-slate-900">
                Registrierung erfolgreich!
              </h2>
              <div className="text-left mb-6 space-y-3">
                <p className="text-sm md:text-base text-slate-700">
                  Wir haben eine Bestätigungs-E-Mail an <strong className="text-slate-900">{formData.email}</strong> gesendet.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-slate-700 mb-2">
                    <strong className="text-slate-900">Wichtig:</strong> Bitte überprüfen Sie Ihr Postfach und klicken Sie auf den Bestätigungslink in der E-Mail, um Ihr Konto zu aktivieren.
                  </p>
                  <p className="text-xs text-slate-600">
                    Nach der Bestätigung können Sie sich mit Ihrer E-Mail-Adresse und Ihrem Passwort anmelden.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setShowVerificationModal(false)}
                className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm text-center"
              >
                Zum Login
              </Link>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  router.push('/');
                }}
                className="w-full px-4 py-2.5 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
              >
                Zur Startseite
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

