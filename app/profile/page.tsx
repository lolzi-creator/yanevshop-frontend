'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, checkEmailVerification, resendVerificationEmail, refreshUser, updateProfile, changePassword } = useAuth();
  
  // Email verification state
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  
  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check URL params for verification status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get('verified');

    if (verified === 'true') {
      setMessage({ type: 'success', text: 'E-Mail wurde erfolgreich bestätigt!' });
      setEmailVerified(true);
      refreshUser();
      window.history.replaceState({}, '', '/profile');
    }
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      setEmailVerified(user.emailVerified || false);
      setProfileData({
        fullName: user.fullName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    setMessage(null);
    try {
      const verified = await checkEmailVerification();
      setEmailVerified(verified);
      if (verified) {
        setMessage({ type: 'success', text: 'E-Mail wurde erfolgreich bestätigt!' });
      } else {
        setMessage({ type: 'error', text: 'E-Mail wurde noch nicht bestätigt.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Fehler beim Prüfen der E-Mail' });
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    setMessage(null);
    try {
      await resendVerificationEmail();
      setMessage({ type: 'success', text: 'Bestätigungs-E-Mail wurde erneut gesendet!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Fehler beim Senden der E-Mail' });
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setMessage(null);
    try {
      await updateProfile(profileData.fullName || undefined, profileData.phone || undefined);
      setMessage({ type: 'success', text: 'Profil erfolgreich aktualisiert!' });
      setIsEditingProfile(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Fehler beim Aktualisieren des Profils' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Die neuen Passwörter stimmen nicht überein.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Das neue Passwort muss mindestens 6 Zeichen lang sein.' });
      return;
    }

    setSavingPassword(true);
    setMessage(null);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage({ type: 'success', text: 'Passwort erfolgreich geändert!' });
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Fehler beim Ändern des Passworts' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20 md:pt-24">
          <div className="text-center">
            <p className="text-slate-600">Lädt...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <section className="flex-grow pt-36 md:pt-40 lg:pt-44 pb-8 md:pb-12 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 md:mb-8 tracking-tight text-slate-900">
              Mein Profil
            </h1>

            {/* Message Alert */}
            {message && (
              <div className={`mb-4 md:mb-6 p-3 md:p-4 rounded-lg text-sm md:text-base ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4 md:space-y-6">
              {/* Email Verification Card */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">E-Mail-Verifizierung</h2>
                  <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${emailVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-xs md:text-sm text-slate-600">Status:</span>
                    <span className={`text-xs md:text-sm font-medium ${
                      emailVerified ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {emailVerified ? 'E-Mail bestätigt' : 'E-Mail nicht bestätigt'}
                    </span>
                  </div>

                  {!emailVerified && (
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2">
                      <button
                        onClick={handleCheckVerification}
                        disabled={checkingVerification}
                        className="flex-1 px-3 md:px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {checkingVerification ? 'Wird geprüft...' : 'Status prüfen'}
                      </button>
                      <button
                        onClick={handleResendVerification}
                        disabled={resendingEmail}
                        className="flex-1 px-3 md:px-4 py-2 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendingEmail ? 'Wird gesendet...' : 'E-Mail erneut senden'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Information Card */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">Persönliche Informationen</h2>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                      Bearbeiten
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <div className="space-y-4 md:space-y-5">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-900 mb-1.5 md:mb-2">
                        E-Mail-Adresse
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 border-2 border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm md:text-base cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-slate-500">E-Mail-Adresse kann nicht geändert werden</p>
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-900 mb-1.5 md:mb-2">
                        Vollständiger Name
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 text-sm md:text-base"
                        placeholder="Ihr vollständiger Name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-900 mb-1.5 md:mb-2">
                        Telefonnummer
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 text-sm md:text-base"
                        placeholder="+41 XX XXX XX XX"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1.5 md:mb-2">
                        Mitglied seit
                      </label>
                      <p className="text-sm md:text-base text-slate-900">
                        {new Date(user.createdAt).toLocaleDateString('de-CH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="flex-1 px-4 py-2 md:py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingProfile ? 'Wird gespeichert...' : 'Speichern'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileData({
                            fullName: user.fullName || '',
                            phone: user.phone || '',
                          });
                          setMessage(null);
                        }}
                        disabled={savingProfile}
                        className="flex-1 px-4 py-2 md:py-2.5 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">E-Mail-Adresse</label>
                      <p className="text-sm md:text-base text-slate-900">{user.email}</p>
                    </div>
                    {user.fullName && (
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Vollständiger Name</label>
                        <p className="text-sm md:text-base text-slate-900">{user.fullName}</p>
                      </div>
                    )}
                    {user.phone && (
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Telefonnummer</label>
                        <p className="text-sm md:text-base text-slate-900">{user.phone}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-600 mb-1">Mitglied seit</label>
                      <p className="text-sm md:text-base text-slate-900">
                        {new Date(user.createdAt).toLocaleDateString('de-CH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Change Password Card */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900">Passwort ändern</h2>
                  {!isChangingPassword && (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                      Passwort ändern
                    </button>
                  )}
                </div>

                {isChangingPassword && (
                  <div className="space-y-4 md:space-y-5">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-900 mb-1.5 md:mb-2">
                        Aktuelles Passwort *
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 text-sm md:text-base"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-900 mb-1.5 md:mb-2">
                        Neues Passwort *
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 text-sm md:text-base"
                        placeholder="Mindestens 6 Zeichen"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-slate-900 mb-1.5 md:mb-2">
                        Neues Passwort bestätigen *
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 text-sm md:text-base"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2">
                      <button
                        onClick={handleChangePassword}
                        disabled={savingPassword}
                        className="flex-1 px-4 py-2 md:py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingPassword ? 'Wird geändert...' : 'Passwort ändern'}
                      </button>
                      <button
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                          setMessage(null);
                        }}
                        disabled={savingPassword}
                        className="flex-1 px-4 py-2 md:py-2.5 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Orders Card */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-slate-900">Bestellungen</h2>
                <Link
                  href="/orders"
                  className="block w-full px-4 md:px-6 py-2 md:py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm md:text-base text-center"
                >
                  Meine Bestellungen anzeigen
                </Link>
              </div>

              {/* Logout Card */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-200 p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-slate-900">Konto</h2>
                <button
                  onClick={logout}
                  className="px-4 md:px-6 py-2 md:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm md:text-base"
                >
                  Abmelden
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
