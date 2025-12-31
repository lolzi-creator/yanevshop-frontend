'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '../context/CartContext';

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  image: string | null;
  sellPrice: number;
  stock: number;
  isActive: boolean;
  productType: 'NEW' | 'OCCASION' | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [selectedProductType, setSelectedProductType] = useState('Alle');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    // Check if category is in URL params
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Update categories when products change
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    const categoryCounts = uniqueCategories.map(cat => ({
      name: cat,
      count: products.filter(p => p.category === cat).length
    }));
    setCategories([
      { name: 'Alle', count: products.length },
      ...categoryCounts
    ]);

    // Update max price
    if (products.length > 0) {
      const maxPrice = Math.max(...products.map(p => p.sellPrice));
      setPriceRange([0, Math.ceil(maxPrice / 100) * 100]); // Round to nearest 100
    }
  }, [products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortOptions = [
    { value: 'default', label: 'Standard' },
    { value: 'price-low', label: 'Preis: Niedrig zu Hoch' },
    { value: 'price-high', label: 'Preis: Hoch zu Niedrig' },
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'name-desc', label: 'Name: Z-A' },
  ];

  // Filter products
  let filteredProducts = products.filter(product => {
    if (!product.isActive) return false;
    const matchesCategory = selectedCategory === 'Alle' || product.category === selectedCategory;
    const matchesProductType = selectedProductType === 'Alle' || product.productType === selectedProductType;
    const matchesPrice = product.sellPrice >= priceRange[0] && product.sellPrice <= priceRange[1];
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStock = !inStockOnly || product.stock > 0;
    return matchesCategory && matchesProductType && matchesPrice && matchesSearch && matchesStock;
  });

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.sellPrice - b.sellPrice;
      case 'price-high':
        return b.sellPrice - a.sellPrice;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const maxPrice = products.length > 0 ? Math.max(...products.map(p => p.sellPrice)) : 1000;

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.image) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.sellPrice,
        image: product.image,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20 md:pt-24 pb-12 md:pb-16">
          <div className="text-center">
            <div className="text-slate-600">Lädt Produkte...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Main Content - Sidebar + Products */}
      <section className="flex-grow py-4 md:py-6 lg:py-8 bg-white pt-24 md:pt-28 lg:pt-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-12">
            
            {/* Left Sidebar - Filters */}
            <aside className="lg:w-72 flex-shrink-0">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden w-full mb-3 px-3 py-2.5 bg-slate-900 text-white rounded-lg font-medium flex items-center justify-between text-sm"
              >
                <span>Filter anzeigen</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>

              {/* Desktop Sidebar */}
              <div className="hidden lg:block sticky top-24">
                <div className="bg-slate-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200 space-y-4 md:space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                  {/* Categories */}
                  <div>
                    <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Kategorien</h2>
                    <ul className="space-y-2">
                      {categories.map((category) => (
                        <li key={category.name}>
                          <button
                            onClick={() => setSelectedCategory(category.name)}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                              selectedCategory === category.name
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{category.name}</span>
                            <span className={`text-xs ${
                              selectedCategory === category.name ? 'text-white/70' : 'text-slate-400'
                            }`}>
                              ({category.count})
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price Range */}
                  <div className="border-t border-slate-200 pt-4 md:pt-6">
                    <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Preisbereich</h2>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          min="0"
                          max={maxPrice}
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                          placeholder="Min"
                        />
                        <span className="text-slate-500">-</span>
                        <input
                          type="number"
                          min="0"
                          max={maxPrice}
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                          placeholder="Max"
                        />
                      </div>
                      <div className="text-xs text-slate-500">
                        CHF {priceRange[0]} - CHF {priceRange[1]}
                      </div>
                    </div>
                  </div>

                  {/* Product Type */}
                  <div className="border-t border-slate-200 pt-4 md:pt-6">
                    <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Badge</h2>
                    <ul className="space-y-2">
                      {['Alle', 'NEW', 'OCCASION'].map((type) => (
                        <li key={type}>
                          <button
                            onClick={() => setSelectedProductType(type)}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              selectedProductType === type
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {type === 'Alle' ? 'Alle' : type === 'NEW' ? 'Neu' : 'Occasion'}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Availability */}
                  <div className="border-t border-slate-200 pt-4 md:pt-6">
                    <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4">Verfügbarkeit</h2>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-sm text-slate-700">Nur verfügbare Produkte</span>
                    </label>
                  </div>

                  {/* Reset Filters */}
                  <div className="border-t border-slate-200 pt-4 md:pt-6">
                    <button
                      onClick={() => {
                        setSelectedCategory('Alle');
                        setSelectedProductType('Alle');
                        setPriceRange([0, maxPrice]);
                        setInStockOnly(false);
                        setSortBy('default');
                        setSearchQuery('');
                      }}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-slate-700 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Filter zurücksetzen
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Filter Drawer */}
              {mobileFiltersOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                    onClick={() => setMobileFiltersOpen(false)}
                  />
                  <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 lg:hidden overflow-y-auto shadow-2xl">
                    <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Filter</h2>
                        <button
                          onClick={() => setMobileFiltersOpen(false)}
                          className="text-slate-500 hover:text-slate-900"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Mobile Filter Content - Same as desktop */}
                      <div className="space-y-6">
                        {/* Categories */}
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-4">Kategorien</h3>
                          <ul className="space-y-2">
                            {categories.map((category) => (
                              <li key={category.name}>
                                <button
                                  onClick={() => {
                                    setSelectedCategory(category.name);
                                    setMobileFiltersOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                                    selectedCategory === category.name
                                      ? 'bg-slate-900 text-white'
                                      : 'text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  <span>{category.name}</span>
                                  <span className={`text-xs ${
                                    selectedCategory === category.name ? 'text-white/70' : 'text-slate-400'
                                  }`}>
                                    ({category.count})
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Product Type */}
                        <div className="border-t border-slate-200 pt-6">
                          <h3 className="text-lg font-semibold text-slate-900 mb-4">Badge</h3>
                          <ul className="space-y-2">
                            {['Alle', 'NEW', 'OCCASION'].map((type) => (
                              <li key={type}>
                                <button
                                  onClick={() => {
                                    setSelectedProductType(type);
                                    setMobileFiltersOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    selectedProductType === type
                                      ? 'bg-slate-900 text-white'
                                      : 'text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {type === 'Alle' ? 'Alle' : type === 'NEW' ? 'Neu' : 'Occasion'}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Price Range */}
                        <div className="border-t border-slate-200 pt-6">
                          <h3 className="text-lg font-semibold text-slate-900 mb-4">Preisbereich</h3>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <input
                                type="number"
                                min="0"
                                max={maxPrice}
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                placeholder="Min"
                              />
                              <span className="text-slate-500">-</span>
                              <input
                                type="number"
                                min="0"
                                max={maxPrice}
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                placeholder="Max"
                              />
                            </div>
                            <div className="text-xs text-slate-500">
                              CHF {priceRange[0]} - CHF {priceRange[1]}
                            </div>
                          </div>
                        </div>


                        {/* Availability */}
                        <div className="border-t border-slate-200 pt-6">
                          <h3 className="text-lg font-semibold text-slate-900 mb-4">Verfügbarkeit</h3>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={inStockOnly}
                              onChange={(e) => setInStockOnly(e.target.checked)}
                              className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                            <span className="text-sm text-slate-700">Nur verfügbare Produkte</span>
                          </label>
                        </div>

                        {/* Reset Filters */}
                        <div className="border-t border-slate-200 pt-6">
                          <button
                            onClick={() => {
                              setSelectedCategory('Alle');
                              setSelectedProductType('Alle');
                              setPriceRange([0, maxPrice]);
                              setInStockOnly(false);
                              setSortBy('default');
                              setSearchQuery('');
                            }}
                            className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Filter zurücksetzen
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </aside>

            {/* Right Side - Search + Products */}
            <div className="flex-1 min-w-0">
              {/* Search Bar + Sort */}
              <div className="mb-4 md:mb-6 lg:mb-8 space-y-3 md:space-y-4">
                <div className="relative">
                  <svg
                    className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Produkte durchsuchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 placeholder-slate-400 text-sm"
                  />
                </div>
                
                {/* Sort + Results Count */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-4">
                  <p className="text-xs md:text-sm text-slate-600">
                    {filteredProducts.length} Produkt{filteredProducts.length !== 1 ? 'e' : ''} gefunden
                  </p>
                  <div className="flex items-center gap-2 md:gap-3">
                    <label htmlFor="sort" className="text-xs md:text-sm text-slate-600 font-medium">Sortieren:</label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-2 md:px-4 py-1.5 md:py-2 border-2 border-slate-200 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-slate-300"
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <Link href={`/products/${product.id}`}>
                      {/* Product Image */}
                      <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-500 ${
                              hoveredProduct === product.id ? 'scale-105' : 'scale-100'
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {/* Category Badge */}
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-medium rounded-full">
                            {product.category}
                          </span>
                        </div>
                        {/* Product Type Badge (NEW/OCCASION) */}
                        {product.productType && (
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-0.5 backdrop-blur-sm text-white text-[10px] font-medium rounded-full ${
                              product.productType === 'NEW' 
                                ? 'bg-blue-600/95' 
                                : 'bg-orange-600/95'
                            }`}>
                              {product.productType === 'NEW' ? 'Neu' : 'Occasion'}
                            </span>
                          </div>
                        )}
                        {/* Stock Badge */}
                        {product.stock <= 0 && (
                          <div className={`absolute ${product.productType ? 'bottom-2 right-2' : 'top-2 right-2'}`}>
                            <span className="px-2 py-0.5 bg-red-500/95 backdrop-blur-sm text-white text-[10px] font-medium rounded-full">
                              Ausverkauft
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-2 md:p-3 lg:p-4">
                        <h3 className="text-xs md:text-sm font-semibold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors duration-300 line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                        
                        {/* Price */}
                        <div className="flex items-center justify-between pt-1.5 md:pt-2 mt-1.5 md:mt-2 border-t border-slate-100">
                          <p className="text-sm md:text-base font-semibold text-slate-900">
                            CHF {product.sellPrice.toFixed(2)}
                          </p>
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={product.stock <= 0}
                            className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
                              product.stock <= 0
                                ? 'bg-slate-300 cursor-not-allowed'
                                : hoveredProduct === product.id
                                ? 'bg-slate-800 scale-110'
                                : 'bg-slate-900 scale-100'
                            }`}
                          >
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-lg text-slate-600 mb-2">Keine Produkte gefunden</p>
                  <p className="text-sm text-slate-500 mb-4">Versuchen Sie es mit anderen Suchbegriffen oder Kategorien</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('Alle');
                      setSearchQuery('');
                    }}
                    className="text-slate-900 font-medium hover:underline"
                  >
                    Filter zurücksetzen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20">
          <div className="text-center px-4 sm:px-6">
            <div className="text-slate-600">Lädt...</div>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
