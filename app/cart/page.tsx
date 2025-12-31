'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20 bg-gradient-to-b from-white to-slate-50">
          <div className="text-center px-4 sm:px-6">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4 sm:mb-6 text-slate-900">
              Ihr Warenkorb ist leer
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mb-8 sm:mb-10 md:mb-12 font-light tracking-wide">
              Fügen Sie Produkte hinzu, um zu beginnen
            </p>
            <Link
              href="/products"
              className="inline-block bg-slate-900 text-white px-8 sm:px-12 py-3 sm:py-4 text-sm sm:text-base font-medium hover:bg-slate-800 transition rounded-lg shadow-md hover:shadow-lg"
            >
              Produkte durchsuchen
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const FREE_SHIPPING_THRESHOLD = 50;
  const subtotal = cartTotal;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 8; // Free shipping over 50 CHF, otherwise 8 CHF
  const tax = 0; // No VAT/MWST
  const total = subtotal + shipping + tax;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-36 md:pt-40 lg:pt-44 pb-4 md:pb-6 lg:pb-8 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-2 md:mb-3 text-slate-900">
            Warenkorb
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-slate-600 font-light">
            {cart.length} Artikel{cart.length !== 1 ? '' : ''} in Ihrem Warenkorb
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-grow py-4 md:py-6 lg:py-8 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4 lg:space-y-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg md:rounded-xl border-2 border-slate-200 hover:border-slate-300 p-3 md:p-4 lg:p-6 transition-all duration-300 shadow-sm hover:shadow-md"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-6">
                    {/* Product Image */}
                    <Link
                      href={`/products/${item.id}`}
                      className="relative w-full sm:w-24 md:w-32 h-40 sm:h-24 md:h-32 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          hoveredItem === item.id ? 'scale-105' : 'scale-100'
                        }`}
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.id}`}
                            className="block mb-1 md:mb-2"
                          >
                            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 hover:text-slate-700 transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">
                            CHF {item.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                          <div className="flex items-center gap-1.5 md:gap-2 border-2 border-slate-200 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors rounded-l-lg"
                              aria-label="Menge reduzieren"
                            >
                              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-10 md:w-12 text-center font-semibold text-slate-900 text-sm md:text-base">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors rounded-r-lg"
                              aria-label="Menge erhöhen"
                            >
                              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs md:text-sm text-red-600 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Entfernen
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs md:text-sm text-slate-600">Zwischensumme</span>
                        <span className="text-base md:text-lg font-semibold text-slate-900">
                          CHF {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <div className="pt-4">
                <button
                  onClick={clearCart}
                  className="text-sm text-slate-600 hover:text-red-600 transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Warenkorb leeren
                </button>
              </div>
            </div>

            {/* Order Summary - Sticky */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 md:top-24 bg-slate-50 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 border-2 border-slate-200 shadow-sm">
                <h2 className="text-lg md:text-xl lg:text-2xl font-semibold mb-4 md:mb-6 tracking-tight text-slate-900">
                  Bestellübersicht
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-slate-200">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-slate-600">Zwischensumme</span>
                    <span className="font-medium text-slate-900">CHF {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-slate-600">Versand</span>
                    {shipping === 0 ? (
                      <span className="font-medium text-green-600">Kostenlos</span>
                    ) : (
                      <span className="font-medium text-slate-900">CHF {shipping.toFixed(2)}</span>
                    )}
                  </div>
                  {shipping > 0 && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-lg text-xs">
                      <p className="text-slate-600">
                        Noch <strong className="text-slate-900">{remainingForFreeShipping.toFixed(2)} CHF</strong> für kostenlosen Versand!
                      </p>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base md:text-lg font-semibold text-slate-900">Gesamt</span>
                    <span className="text-xl md:text-2xl font-bold text-slate-900">CHF {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2 md:space-y-3">
                  <Link
                    href="/checkout"
                    className="block w-full px-4 md:px-6 py-2.5 md:py-3.5 bg-slate-900 text-white text-center rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Zur Kasse
                  </Link>
                  <Link
                    href="/products"
                    className="block w-full px-4 md:px-6 py-2.5 md:py-3.5 text-center border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm md:text-base"
                  >
                    Weiter einkaufen
                  </Link>
                </div>

                {/* Security Badge */}
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500">
                    <svg className="w-3 h-3 md:w-4 md:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Sichere Zahlung</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
