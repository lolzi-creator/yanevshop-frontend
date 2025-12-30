'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  image: string | null;
  sku: string | null;
  barcode: string | null;
  purchasePrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products/${productId}`);
      
      if (!response.ok) {
        throw new Error('Produkt nicht gefunden');
      }

      const data = await response.json();
      setProduct(data.product);
      
      // Initialize images array
      if (data.product.image) {
        setImages([data.product.image]);
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden des Produkts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSaveImages = async () => {
    try {
      setUploading(true);
      // Update product with first image (main image)
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: images[0] || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      // TODO: Save additional images to a separate table or JSON field
      // For now, we'll just save the first image as the main image
      await fetchProduct();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern der Bilder');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-slate-600">Lädt Produkt...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Produkt nicht gefunden'}</p>
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                ← Zurück
              </Link>
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900">
                {product.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                product.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {product.isActive ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Images Section */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Bilder</h2>
              
              {/* Main Image */}
              {images.length > 0 && (
                <div className="mb-4">
                  <img
                    src={images[0]}
                    alt={product.name}
                    className="w-full h-64 sm:h-80 object-cover rounded-lg border-2 border-slate-200"
                  />
                </div>
              )}

              {/* Additional Images Grid */}
              {images.length > 1 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {images.slice(1).map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`${product.name} ${index + 2}`}
                        className="w-full h-24 object-cover rounded border border-slate-200"
                      />
                      <button
                        onClick={() => handleRemoveImage(index + 1)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Image */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Bild-URL hinzufügen"
                  className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
                >
                  Hinzufügen
                </button>
              </div>

              {images.length > 0 && (
                <button
                  onClick={handleSaveImages}
                  disabled={uploading}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  {uploading ? 'Wird gespeichert...' : 'Bilder speichern'}
                </button>
              )}
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Produktinformationen</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Name</label>
                  <p className="text-base text-slate-900 font-medium">{product.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Kategorie</label>
                  <p className="text-base text-slate-900">{product.category}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Beschreibung</label>
                  <p className="text-base text-slate-900 whitespace-pre-wrap">
                    {product.description || 'Keine Beschreibung'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">SKU</label>
                    <p className="text-base text-slate-900 font-mono">{product.sku || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Barcode</label>
                    <p className="text-base text-slate-900 font-mono">{product.barcode || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Preise</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Einkaufspreis</label>
                  <p className="text-2xl font-semibold text-slate-900">
                    {product.purchasePrice.toFixed(2)} CHF
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Verkaufspreis</label>
                  <p className="text-2xl font-semibold text-slate-900">
                    {product.sellPrice.toFixed(2)} CHF
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Gewinnspanne</label>
                  <p className="text-xl font-semibold text-green-600">
                    {((product.sellPrice - product.purchasePrice) / product.sellPrice * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-600">
                    {(product.sellPrice - product.purchasePrice).toFixed(2)} CHF Gewinn pro Einheit
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Lagerbestand</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Aktueller Bestand</label>
                  <p className={`text-3xl font-semibold ${
                    product.stock <= product.minStock ? 'text-red-600' : 'text-slate-900'
                  }`}>
                    {product.stock}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Mindestbestand</label>
                  <p className="text-xl font-semibold text-slate-900">{product.minStock}</p>
                </div>

                {product.stock <= product.minStock && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">
                      ⚠️ Niedriger Bestand! Bitte nachbestellen.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Statistiken</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Verkauft</label>
                  <p className="text-2xl font-semibold text-slate-900">0</p>
                  <p className="text-xs text-slate-500">(Wird später implementiert)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Umsatz</label>
                  <p className="text-2xl font-semibold text-slate-900">0.00 CHF</p>
                  <p className="text-xs text-slate-500">(Wird später implementiert)</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Zeitstempel</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Erstellt am</label>
                  <p className="text-base text-slate-900">
                    {new Date(product.createdAt).toLocaleString('de-CH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Zuletzt aktualisiert</label>
                  <p className="text-base text-slate-900">
                    {new Date(product.updatedAt).toLocaleString('de-CH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

