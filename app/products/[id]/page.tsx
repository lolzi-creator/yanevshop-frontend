'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  image: string | null;
  images: string[];
  sellPrice: number;
  stock: number;
  isActive: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      const data = await response.json();
      setProduct(data.product);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden des Produkts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || !product.image) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.sellPrice,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20">
          <div className="text-center px-4 sm:px-6">
            <div className="text-slate-600">Lädt Produkt...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20">
          <div className="text-center px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight mb-4 sm:mb-6 text-slate-900">
              Produkt nicht gefunden
            </h1>
            <Link
              href="/products"
              className="text-slate-900 hover:text-slate-700 transition-colors tracking-wider text-sm font-medium border-b border-slate-900"
            >
              Zurück zu Produkten
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const displayImage = images[selectedImage] || product.image;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Breadcrumb */}
      <section className="pt-16 md:pt-20 lg:pt-24 pb-4 md:pb-6 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
          <nav className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-600 mb-4 md:mb-6 lg:mb-8">
            <Link href="/" className="hover:text-slate-900 transition-colors">Startseite</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-slate-900 transition-colors">Produkte</Link>
            <span>/</span>
            <span className="text-slate-900">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Details */}
      <section className="flex-grow py-4 md:py-6 lg:py-8 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-4 md:gap-6 lg:gap-12">
            
            {/* Product Images */}
            <div className="space-y-3 md:space-y-4">
              <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-slate-900'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4 md:space-y-6">
              {/* Category & Name */}
              <div>
                <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 bg-slate-100 text-slate-900 text-[10px] md:text-xs font-medium rounded-full mb-2 md:mb-3">
                  {product.category}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 mb-3 md:mb-4">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-2 md:gap-3 mb-4 md:mb-6">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                    CHF {product.sellPrice.toFixed(2)}
                  </p>
                  {product.stock > 0 ? (
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-green-50 text-green-700 text-[10px] md:text-xs font-medium rounded-full">
                      Auf Lager ({product.stock})
                    </span>
                  ) : (
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-red-50 text-red-700 text-[10px] md:text-xs font-medium rounded-full">
                      Ausverkauft
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-2 md:mb-3">Beschreibung</h2>
                  <p className="text-sm md:text-base text-slate-600 font-light leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Add to Cart */}
              <div className="pt-4 md:pt-6 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`flex-1 px-4 md:px-6 py-3 md:py-4 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm md:text-base ${
                      product.stock <= 0
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : added
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {added ? (
                      <>
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs md:text-sm">Hinzugefügt</span>
                      </>
                    ) : product.stock <= 0 ? (
                      <>
                        <span className="text-xs md:text-sm">Nicht verfügbar</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-xs md:text-sm">In den Warenkorb</span>
                      </>
                    )}
                  </button>
                  <button className="px-4 md:px-6 py-3 md:py-4 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm md:text-base">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="hidden sm:inline">Merken</span>
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-4 md:pt-6 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Kostenloser Versand</p>
                    <p className="text-slate-900 font-medium">In der ganzen Schweiz</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Rückgabe</p>
                    <p className="text-slate-900 font-medium">30 Tage Garantie</p>
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
