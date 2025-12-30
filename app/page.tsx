'use client';

import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  sellPrice: number;
  image: string | null;
  category: string;
  isActive?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Fixed product categories
export const PRODUCT_CATEGORIES = [
  'Skier',
  'Schuhe',
  'Technik',
  'Zubehör'
] as const;

const defaultCategories = [
  {
    name: 'Skier',
    // Search terms: "alpine skis", "ski equipment", "professional skis", "skiing gear"
    image: 'https://images.unsplash.com/photo-1552853662-8f707e1cb336?q=80&w=2346&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    count: 0,
    description: 'Professionelle Skier für jede Piste'
  },
  {
    name: 'Schuhe',
    // Search terms: "ski boots", "winter boots", "hiking boots", "outdoor footwear"
    image: 'https://images.unsplash.com/photo-1634044439395-3251148b9b2c?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    count: 0,
    description: 'Komfortable und warme Skischuhe'
  },
  {
    name: 'Technik',
    // Search terms: "technology gadgets", "smart devices", "electronics", "tech equipment", "digital devices"
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop',
    count: 0,
    description: 'Moderne Technologie für Ihre Ausrüstung'
  },
  {
    name: 'Zubehör',
    // Search terms: "ski accessories", "winter gear", "outdoor equipment", "sports accessories"
    image: 'https://images.unsplash.com/photo-1703694741127-64f46e544971?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    count: 0,
    description: 'Alles was Sie für die Piste brauchen'
  }
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      const products = (data.products || []).filter((p: Product) => p.isActive && p.image);
      
      // Set featured products (first 4 with images)
      setFeaturedProducts(products.slice(0, 4));

      // Update categories with real counts
      const updatedCategories = defaultCategories.map(cat => ({
        ...cat,
        count: products.filter((p: Product) => p.category === cat.name).length
      }));
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate products
  useEffect(() => {
    if (featuredProducts.length === 0) return;
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Split Hero Section - Mobile Optimized */}
      <section className="relative pt-16 md:pt-20 lg:pt-28 pb-8 md:pb-0 md:min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-12 lg:gap-16 items-center md:min-h-[calc(100vh-7rem)]">
            
            {/* Left Side - Info & CTA */}
            <div className="flex flex-col justify-center space-y-4 md:space-y-8 order-2 md:order-1">
              <div className="space-y-2 md:space-y-4">
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-slate-900 tracking-tight leading-tight">
                  Premium Ski<br />
                  Ausrüstung
                </h1>
                <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-slate-600 font-light leading-relaxed max-w-lg">
                  Hochwertige Ski-Ausrüstung für Ihre perfekte Pisten-Erfahrung.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-5 sm:px-8 py-2.5 sm:py-4 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors duration-300 rounded-lg shadow-md hover:shadow-lg"
                >
                  Jetzt einkaufen
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-5 sm:px-8 py-2.5 sm:py-4 text-sm font-medium text-slate-900 border-2 border-slate-900 hover:bg-slate-50 transition-colors duration-300 rounded-lg"
                >
                  Mehr erfahren
                </Link>
              </div>

              {/* Features - Hidden on mobile */}
              <div className="hidden sm:grid grid-cols-3 gap-4 md:gap-6 pt-4 md:pt-8 border-t border-slate-200">
                <div>
                  <div className="text-xl md:text-2xl font-semibold text-slate-900">24/7</div>
                  <div className="text-xs md:text-sm text-slate-600 mt-1">Support</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-semibold text-slate-900">100%</div>
                  <div className="text-xs md:text-sm text-slate-600 mt-1">Qualität</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-semibold text-slate-900">CH</div>
                  <div className="text-xs md:text-sm text-slate-600 mt-1">Made in</div>
                </div>
              </div>
            </div>

            {/* Right Side - Rotating Products */}
            <div className="relative h-[300px] sm:h-[400px] md:h-[600px] lg:h-[700px] flex items-center justify-center order-1 md:order-2">
              {loading ? (
                <div className="text-slate-600">Lädt Produkte...</div>
              ) : featuredProducts.length > 0 ? (
                <>
                  <div className="relative w-full h-full max-w-sm sm:max-w-md mx-auto">
                    {featuredProducts.map((product, index) => {
                      const isActive = index === currentProductIndex;
                      const offset = index - currentProductIndex;
                      const absOffset = Math.abs(offset);
                      
                      return (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                            isActive
                              ? 'opacity-100 scale-100 z-10'
                              : absOffset === 1
                              ? 'opacity-20 scale-70 z-0'
                              : 'opacity-0 scale-50 z-0'
                          } ${offset > 0 ? 'translate-x-8 sm:translate-x-20' : offset < 0 ? '-translate-x-8 sm:-translate-x-20' : ''}`}
                        >
                          <div className="relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl bg-white border border-slate-200">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                            {isActive && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-3 sm:p-6 text-white">
                                <div className="text-xs sm:text-sm font-medium text-white/90 mb-1">{product.category}</div>
                                <div className="text-base sm:text-xl font-semibold mb-1 sm:mb-2">{product.name}</div>
                                <div className="text-sm sm:text-lg font-medium">CHF {product.sellPrice.toFixed(2)}</div>
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Product Indicators */}
                  <div className="absolute bottom-2 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                    {featuredProducts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentProductIndex(index)}
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                          index === currentProductIndex
                            ? 'w-6 sm:w-8 bg-slate-900'
                            : 'w-1.5 sm:w-2 bg-slate-300 hover:bg-slate-400'
                        }`}
                        aria-label={`Produkt ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-slate-600">Keine Produkte verfügbar</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Modern Creative Layout */}
      <section className="py-8 md:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 md:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold mb-2 md:mb-3 tracking-tight text-slate-900">
              Kategorien
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-slate-600 font-light max-w-2xl">
              Entdecken Sie unsere sorgfältig kuratierten Kollektionen
            </p>
          </div>
          
          {/* Asymmetric Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            {/* First Category - Large Featured */}
            <Link
              href={`/products?category=${encodeURIComponent(categories[0].name)}`}
              className="group relative md:col-span-2 md:row-span-2 h-[200px] sm:h-[250px] md:h-[500px] rounded-xl md:rounded-2xl overflow-hidden bg-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${categories[0].image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 lg:p-10">
                <div className="mb-2">
                  <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] md:text-xs font-medium rounded-full mb-2 md:mb-3">
                    {categories[0].count} Produkte
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-1 md:mb-2 group-hover:translate-x-2 transition-transform duration-300">
                  {categories[0].name}
                </h3>
                <p className="text-white/90 text-xs md:text-sm lg:text-base font-light max-w-md mb-2 md:mb-4 hidden md:block">
                  {categories[0].description}
                </p>
                <div className="flex items-center text-white text-xs md:text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                  Entdecken
                  <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Second Category - Medium */}
            <Link
              href={`/products?category=${encodeURIComponent(categories[1].name)}`}
              className="group relative h-[150px] sm:h-[180px] md:h-[245px] rounded-xl md:rounded-2xl overflow-hidden bg-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${categories[1].image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-800/50 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-5 lg:p-6">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white mb-1 group-hover:translate-y-[-4px] transition-transform duration-300">
                  {categories[1].name}
                </h3>
                <p className="text-white/80 text-[10px] md:text-xs lg:text-sm font-light mb-2">
                  {categories[1].count} Produkte
                </p>
              </div>
            </Link>

            {/* Third Category - Medium */}
            <Link
              href={`/products?category=${encodeURIComponent(categories[2].name)}`}
              className="group relative h-[150px] sm:h-[180px] md:h-[245px] rounded-xl md:rounded-2xl overflow-hidden bg-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${categories[2].image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-800/50 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-5 lg:p-6">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white mb-1 group-hover:translate-y-[-4px] transition-transform duration-300">
                  {categories[2].name}
                </h3>
                <p className="text-white/80 text-[10px] md:text-xs lg:text-sm font-light mb-2">
                  {categories[2].count} Produkte
                </p>
              </div>
            </Link>

            {/* Fourth Category - Wide */}
            <Link
              href={`/products?category=${encodeURIComponent(categories[3].name)}`}
              className="group relative md:col-span-2 h-[150px] sm:h-[180px] md:h-[245px] rounded-xl md:rounded-2xl overflow-hidden bg-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${categories[3].image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-800/50 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center md:justify-end p-3 md:p-5 lg:p-6">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white mb-1 group-hover:translate-x-2 transition-transform duration-300">
                  {categories[3].name}
                </h3>
                <p className="text-white/80 text-[10px] md:text-xs lg:text-sm font-light mb-2">
                  {categories[3].count} Produkte verfügbar
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Yanev Shop Section - Modern & Creative */}
      <section className="py-8 md:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 md:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold mb-2 md:mb-3 tracking-tight text-slate-900">
              Warum Yanev Shop?
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-slate-600 font-light max-w-2xl">
              Was uns auszeichnet
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="group p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-slate-900 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-7 md:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-base md:text-lg lg:text-xl font-semibold text-slate-900 mb-2 md:mb-3">Premium Qualität</h3>
              <p className="text-xs md:text-sm text-slate-600 font-light leading-relaxed">
                Jedes Produkt wird mit Schweizer Präzision aus den feinsten Materialien gefertigt
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-slate-900 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-7 md:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-base md:text-lg lg:text-xl font-semibold text-slate-900 mb-2 md:mb-3">Sichere Zahlung</h3>
              <p className="text-xs md:text-sm text-slate-600 font-light leading-relaxed">
                Ihre Transaktionen sind durch branchenführende Sicherheitsstandards geschützt
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-slate-900 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-7 md:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-base md:text-lg lg:text-xl font-semibold text-slate-900 mb-2 md:mb-3">Schneller Versand</h3>
              <p className="text-xs md:text-sm text-slate-600 font-light leading-relaxed">
                Express-Lieferung in der ganzen Schweiz, damit Sie schneller auf die Piste kommen
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section - Modern Design */}
      <section className="py-6 md:py-12 lg:py-16 bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
              {/* Left Side - Content */}
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-3 md:mb-4 tracking-tight text-white">
                  Bleiben Sie auf dem Laufenden
                </h2>
                <p className="text-sm md:text-base lg:text-lg text-slate-300 mb-4 md:mb-6 font-light leading-relaxed">
                  Erhalten Sie exklusive Angebote, Neuheiten und Experten-Tipps direkt in Ihr Postfach
                </p>
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-slate-400 text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Kein Spam</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Jederzeit abmeldbar</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-xl">
                <form className="space-y-3 md:space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-xs md:text-sm font-medium text-slate-900 mb-2">
                      E-Mail-Adresse
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="ihre@email.com"
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors duration-300 font-medium shadow-md hover:shadow-lg text-sm md:text-base"
                  >
                    Abonnieren
                  </button>
                  <p className="text-[10px] md:text-xs text-slate-500 text-center">
                    Mit der Anmeldung stimmen Sie unserer Datenschutzerklärung zu
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
