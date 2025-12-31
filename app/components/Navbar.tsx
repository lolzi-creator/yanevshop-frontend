'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, cartTotal } = useCart();
  const { user, logout, loading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const FREE_SHIPPING_THRESHOLD = 50;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - (cartTotal || 0));

  useEffect(() => {
    const updateNavbarPosition = () => {
      if (bannerRef.current) {
        const bannerHeight = bannerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--banner-height', `${bannerHeight}px`);
      }
    };

    updateNavbarPosition();
    window.addEventListener('resize', updateNavbarPosition);
    return () => window.removeEventListener('resize', updateNavbarPosition);
  }, []);

  return (
    <>
      {/* Free Shipping Banner - Always visible */}
      <div ref={bannerRef} id="shipping-banner" className="fixed top-0 left-0 right-0 z-[60] bg-slate-900 text-white text-center py-2 px-4 text-xs sm:text-sm">
        {cartTotal > 0 && cartTotal < FREE_SHIPPING_THRESHOLD ? (
          <p>
            Noch <strong>{remainingForFreeShipping.toFixed(2)} CHF</strong> bis zum kostenlosen Versand! 🚚
          </p>
        ) : cartTotal >= FREE_SHIPPING_THRESHOLD ? (
          <p>
            ✓ Kostenloser Versand! 🎉
          </p>
        ) : (
          <p>
            🚚 Kostenloser Versand ab 50 CHF
          </p>
        )}
      </div>
      <nav className="fixed left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-blue-100/50 shadow-sm" style={{ top: 'var(--banner-height, 32px)' }}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link 
            href="/" 
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img 
              src="/yanevLogo.png" 
              alt="Yanev Shop" 
              className="h-10 md:h-14 w-auto"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <ul className="hidden md:flex gap-8 lg:gap-12 items-center">
            <li>
              <Link
                href="/"
                className={`text-sm tracking-normal font-medium transition relative ${
                  pathname === '/' 
                    ? 'text-slate-900' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Startseite
                {pathname === '/' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-slate-900" />
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className={`text-sm uppercase tracking-wider font-medium transition relative ${
                  pathname === '/products' 
                    ? 'text-blue-600' 
                    : 'text-slate-700 hover:text-blue-600'
                }`}
              >
                Produkte
                {pathname === '/products' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-slate-900" />
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className={`text-sm uppercase tracking-wider font-medium transition relative ${
                  pathname === '/about' 
                    ? 'text-blue-600' 
                    : 'text-slate-700 hover:text-blue-600'
                }`}
              >
                Über uns
                {pathname === '/about' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-slate-900" />
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className={`text-sm uppercase tracking-wider font-medium transition relative ${
                  pathname === '/contact' 
                    ? 'text-blue-600' 
                    : 'text-slate-700 hover:text-blue-600'
                }`}
              >
                Kontakt
                {pathname === '/contact' && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-slate-900" />
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className="relative text-sm tracking-normal font-medium text-slate-600 hover:text-slate-900 transition flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="hidden lg:inline">Warenkorb</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>
            <li>
              {!authLoading && (
                user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
                    >
                      <span className="hidden lg:inline">{user.fullName || user.email}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* User Dropdown Menu */}
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                          >
                            Profil
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                          >
                            Meine Bestellungen
                          </Link>
                          <div className="border-t border-slate-200 my-1" />
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                          >
                            Abmelden
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                  >
                    Anmelden
                  </Link>
                )
              )}
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <Link
              href="/cart"
              className="relative text-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 focus:outline-none hover:text-slate-900 transition"
              aria-label="Menü öffnen"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-blue-100/50 py-4 bg-white/95 backdrop-blur-xl">
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-sm tracking-normal font-medium transition ${
                    pathname === '/' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Startseite
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-sm uppercase tracking-wider font-medium transition ${
                    pathname === '/products' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  Produkte
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-sm uppercase tracking-wider font-medium transition ${
                    pathname === '/about' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  Über uns
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-sm uppercase tracking-wider font-medium transition ${
                    pathname === '/contact' ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  Kontakt
                </Link>
              </li>
              <li className="border-t border-slate-200 pt-4 mt-4">
                {!authLoading && (
                  user ? (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-sm text-slate-600 hover:text-slate-900 transition py-2"
                      >
                        {user.fullName || user.email}
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="text-left text-sm font-medium text-slate-600 hover:text-slate-900 transition py-2"
                      >
                        Abmelden
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                    >
                      Anmelden
                    </Link>
                  )
                )}
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}
