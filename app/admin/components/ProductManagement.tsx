'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import JsBarcode from 'jsbarcode';
import { Html5Qrcode } from 'html5-qrcode';

// Fixed product categories
const PRODUCT_CATEGORIES = ['Skier', 'Schuhe', 'Technik', 'Zubehör'] as const;

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
  productType: 'NEW' | 'OCCASION' | null;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ProductManagementProps {
  products: Product[];
  loading: boolean;
  onRefresh: () => void;
}

export default function ProductManagement({ products, loading, onRefresh }: ProductManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedProductBarcode, setSelectedProductBarcode] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image: '',
    sku: '',
    barcode: '',
    purchasePrice: '',
    sellPrice: '',
    stock: '',
    minStock: '',
    isActive: true,
    productType: '' as 'NEW' | 'OCCASION' | '',
  });
  const [productImages, setProductImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      setUploadProgress(50);

      // Upload via backend (bypasses RLS)
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/api/storage/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setUploadProgress(100);
      return data.url;
    } catch (err: any) {
      console.error('Upload error:', err);
      throw new Error(err.message || 'Fehler beim Hochladen des Bildes');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Bitte wählen Sie eine Bilddatei aus');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Die Datei ist zu groß. Maximale Größe: 5MB');
      return;
    }

    try {
      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        const newImages = [...productImages, imageUrl];
        setProductImages(newImages);
        // Set first image as main image
        if (productImages.length === 0) {
          setFormData({ ...formData, image: imageUrl });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Hochladen');
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setProductImages([...productImages, newImageUrl.trim()]);
      setNewImageUrl('');
      // Set first image as main image
      if (productImages.length === 0) {
        setFormData({ ...formData, image: newImageUrl.trim() });
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = productImages.filter((_, i) => i !== index);
    setProductImages(newImages);
    // Update main image if first image was removed
    if (index === 0 && newImages.length > 0) {
      setFormData({ ...formData, image: newImages[0] });
    } else if (newImages.length === 0) {
      setFormData({ ...formData, image: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Use first image as main image, or formData.image if set
      const mainImage = productImages.length > 0 ? productImages[0] : formData.image;

      const productData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        image: mainImage || null,
        sku: formData.sku || null,
        barcode: formData.barcode || null,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        sellPrice: parseFloat(formData.sellPrice),
        stock: parseInt(formData.stock) || 0,
        minStock: parseInt(formData.minStock) || 0,
        isActive: formData.isActive,
        productType: formData.productType || null,
      };

      const url = editingProduct
        ? `${API_URL}/api/products/${editingProduct.id}`
        : `${API_URL}/api/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Speichern');
      }

      onRefresh();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern des Produkts');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      image: product.image || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      purchasePrice: product.purchasePrice.toString(),
      sellPrice: product.sellPrice.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      isActive: product.isActive,
      productType: product.productType || '',
    });
    // Initialize images array with existing image
    setProductImages(product.image ? [product.image] : []);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie dieses Produkt wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen');
      }

      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Löschen des Produkts');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      image: '',
      sku: '',
      barcode: '',
      purchasePrice: '',
      sellPrice: '',
      stock: '',
      minStock: '',
      isActive: true,
      productType: '',
    });
    setProductImages([]);
    setNewImageUrl('');
    setShowPreview(false);
    setError(null);
  };

  // Barcode Scanner
  useEffect(() => {
    let isMounted = true;
    let scannerInstance: Html5Qrcode | null = null;

    if (showScanner) {
      const initScanner = async () => {
        try {
          const scanner = new Html5Qrcode('barcode-scanner');
          scannerInstance = scanner;
          scannerRef.current = scanner;

          await scanner.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              if (isMounted) {
                setSearchTerm(decodedText);
                setShowScanner(false);
                scanner.stop().catch(() => {
                  // Ignore stop errors
                });
              }
            },
            (errorMessage) => {
              // Ignore scan errors
            }
          );
        } catch (err) {
          console.error('Scanner error:', err);
          if (isMounted) {
            setError('Kamera-Zugriff fehlgeschlagen. Bitte Berechtigungen prüfen.');
            setShowScanner(false);
          }
        }
      };

      initScanner();
    } else {
      // Stop scanner if it's running
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {
          // Ignore stop errors - scanner might not be running
        });
        try {
          scannerRef.current.clear();
        } catch (err) {
          // Ignore clear errors
        }
        scannerRef.current = null;
      }
    }

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {
          // Ignore stop errors - scanner might not be running
        });
        try {
          scannerRef.current.clear();
        } catch (err) {
          // Ignore clear errors
        }
        scannerRef.current = null;
      }
    };
  }, [showScanner]);

  // Generate barcode image
  useEffect(() => {
    if (showBarcodeModal && selectedProductBarcode && barcodeCanvasRef.current) {
      try {
        JsBarcode(barcodeCanvasRef.current, selectedProductBarcode, {
          format: 'EAN13',
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 20,
        });
      } catch (error) {
        console.error('Barcode generation error:', error);
      }
    }
  }, [showBarcodeModal, selectedProductBarcode]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Lädt Produkte...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Produktverwaltung</h2>
        <p className="text-slate-600">Verwalten Sie Ihre Produkte, Lagerbestände und Barcodes</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Suchen (Name, Barcode, SKU)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 md:px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm md:text-base"
            />
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="px-3 sm:px-4 py-2 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium whitespace-nowrap text-sm sm:text-base"
              title="Barcode scannen"
            >
              📷
            </button>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 md:px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm md:text-base bg-white"
          >
            <option value="">Alle Kategorien</option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 sm:px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium whitespace-nowrap text-sm sm:text-base"
          >
            + Neues Produkt
          </button>
        </div>
      </div>

      {/* Barcode Scanner */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-900">Barcode scannen</h3>
              <button
                onClick={() => setShowScanner(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div id="barcode-scanner" className="w-full rounded-lg overflow-hidden mb-4" style={{ minHeight: '300px' }} />
            <p className="text-sm text-slate-600 text-center">Richten Sie die Kamera auf den Barcode</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900">Name</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 hidden md:table-cell">Kategorie</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 hidden lg:table-cell">Barcode</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900">Preis</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900">Lager</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 hidden sm:table-cell">Status</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    Keine Produkte gefunden
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-900 font-medium text-xs sm:text-sm">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded border border-slate-200 hidden sm:block"
                          />
                        )}
                        <span className="truncate max-w-[150px] sm:max-w-none">{product.name}</span>
                      </Link>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-600 text-xs sm:text-sm hidden md:table-cell">{product.category}</td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-600 font-mono text-xs sm:text-sm hidden lg:table-cell">
                      {product.barcode ? (
                        <button
                          onClick={() => {
                            setSelectedProductBarcode(product.barcode!);
                            setShowBarcodeModal(true);
                          }}
                          className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors font-medium"
                        >
                          Barcode
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-900 font-medium text-xs sm:text-sm">{product.sellPrice.toFixed(2)} CHF</td>
                    <td className={`px-2 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm ${
                      product.stock <= product.minStock ? 'text-red-600' : 'text-slate-900'
                    }`}>
                      {product.stock}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-xs sm:text-sm"
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Beschreibung</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Kategorie *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
                  >
                    <option value="">Kategorie auswählen</option>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Produkt-Badge</label>
                  <select
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value as 'NEW' | 'OCCASION' | '' })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
                  >
                    <option value="">Kein Badge</option>
                    <option value="NEW">Neu</option>
                    <option value="OCCASION">Occasion</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">
                    Produktbilder {productImages.length > 0 && `(${productImages.length})`}
                  </label>
                  
                  {/* Images Grid */}
                  {productImages.length > 0 && (
                    <div className="mb-3 grid grid-cols-3 gap-2">
                      {productImages.map((img, index) => (
                        <div key={index} className="relative group">
                          {index === 0 && (
                            <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded z-10">
                              Hauptbild
                            </span>
                          )}
                          <img
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {uploading ? `Wird hochgeladen... ${uploadProgress}%` : '📷 Bild hochladen'}
                    </button>
                    
                    {/* Manual URL Input */}
                    <div className="flex-1 flex gap-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImage();
                          }
                        }}
                        placeholder="Bild-URL eingeben"
                        className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
                      >
                        Hinzufügen
                      </button>
                    </div>
                  </div>
                  
                  {uploading && (
                    <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-slate-900 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Einkaufspreis (CHF)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Verkaufspreis (CHF) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Lagerbestand</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Mindestbestand</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-slate-900 border-2 border-slate-300 rounded focus:ring-2 focus:ring-slate-900"
                    />
                    <span className="text-sm font-medium text-slate-900">Produkt ist aktiv</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-6 py-2.5 border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  {showPreview ? 'Vorschau ausblenden' : '👁️ Vorschau anzeigen'}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                >
                  {editingProduct ? 'Aktualisieren' : 'Erstellen'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-2.5 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Abbrechen
                </button>
              </div>
            </form>

            {/* Product Preview */}
            {showPreview && (
              <div className="border-t border-slate-200 p-6 bg-slate-50">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Vorschau der Produktkarte</h4>
                <div className="max-w-xs mx-auto">
                  <div className="group bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                      {productImages.length > 0 ? (
                        <img
                          src={productImages[0]}
                          alt={formData.name || 'Produkt'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          Kein Bild
                        </div>
                      )}
                      {/* Category Badge */}
                      {formData.category && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-medium rounded-full">
                            {formData.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3 lg:p-4">
                      <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2 leading-tight min-h-[2.5rem]">
                        {formData.name || 'Produktname'}
                      </h3>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
                        <p className="text-base font-semibold text-slate-900">
                          CHF {formData.sellPrice ? parseFloat(formData.sellPrice).toFixed(2) : '0.00'}
                        </p>
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white group-hover:bg-slate-800 transition-all duration-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Barcode Display/Print Modal */}
      {showBarcodeModal && selectedProductBarcode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-900">Barcode drucken</h3>
              <button
                onClick={() => {
                  setShowBarcodeModal(false);
                  setSelectedProductBarcode(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <canvas ref={barcodeCanvasRef} className="bg-white" />
              <p className="text-sm text-slate-600 font-mono">{selectedProductBarcode}</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    if (barcodeCanvasRef.current) {
                      const link = document.createElement('a');
                      link.download = `barcode-${selectedProductBarcode}.png`;
                      link.href = barcodeCanvasRef.current.toDataURL();
                      link.click();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                >
                  Download
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 px-4 py-2 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Drucken
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

