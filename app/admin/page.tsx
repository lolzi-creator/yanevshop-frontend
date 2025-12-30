'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductManagement from './components/ProductManagement';
import FinanceManagement from './components/FinanceManagement';

type TabType = 'products' | 'orders' | 'finance';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  pendingOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/admin/all`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const [productsRes, ordersRes, financeRes] = await Promise.all([
        fetch(`${API_URL}/api/products/admin/all`),
        fetch(`${API_URL}/api/orders?status=PENDING`),
        fetch(`${API_URL}/api/finance/stats`),
      ]);

      let totalProducts = 0;
      let lowStockProducts = 0;
      let outOfStockProducts = 0;

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        const allProducts = productsData.products || [];
        totalProducts = allProducts.length;
        lowStockProducts = allProducts.filter((p: any) => p.stock > 0 && p.stock <= p.minStock).length;
        outOfStockProducts = allProducts.filter((p: any) => p.stock <= 0).length;
      }

      let pendingOrders = 0;
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        pendingOrders = ordersData.orders?.length || 0;
      }

      let totalRevenue = 0;
      if (financeRes.ok) {
        const financeData = await financeRes.json();
        totalRevenue = financeData.totalRevenue || 0;
      }

      setStats({
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        pendingOrders,
        totalRevenue,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const tabs = [
    { id: 'products' as TabType, label: 'Produkte', icon: '📦', href: '/admin' },
    { id: 'orders' as TabType, label: 'Bestellungen', icon: '🛒', href: '/admin/orders' },
    { id: 'finance' as TabType, label: 'Finanzen', icon: '💰', href: '/admin' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">Y</span>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900">
                Yanev Shop Admin
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-slate-600 hidden md:inline">Admin Dashboard</span>
              <button className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                Einstellungen
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 lg:min-h-[calc(100vh-73px)]">
          <nav className="p-2 sm:p-4 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {tabs.map((tab) => {
              if (tab.id === 'orders') {
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg sm:text-xl">{tab.icon}</span>
                    <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                  </Link>
                );
              }
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg sm:text-xl">{tab.icon}</span>
                  <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard Summary Cards */}
            {(activeTab === 'products' || activeTab === 'finance') && (
              <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Total Products */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Gesamt Produkte</p>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                          {statsLoading ? '...' : stats.totalProducts}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                    </div>
                  </div>

                  {/* Low Stock Alert */}
                  <div className={`rounded-xl border p-4 sm:p-6 shadow-sm ${
                    stats.lowStockProducts > 0 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm mb-1 ${
                          stats.lowStockProducts > 0 ? 'text-red-700' : 'text-slate-600'
                        }`}>
                          Niedriger Bestand
                        </p>
                        <p className={`text-2xl sm:text-3xl font-bold ${
                          stats.lowStockProducts > 0 ? 'text-red-700' : 'text-slate-900'
                        }`}>
                          {statsLoading ? '...' : stats.lowStockProducts}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        stats.lowStockProducts > 0 ? 'bg-red-100' : 'bg-slate-100'
                      }`}>
                        <span className="text-2xl">⚠️</span>
                      </div>
                    </div>
                  </div>

                  {/* Pending Orders */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Ausstehende Bestellungen</p>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                          {statsLoading ? '...' : stats.pendingOrders}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🛒</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Revenue */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Gesamtumsatz</p>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                          {statsLoading ? '...' : `${stats.totalRevenue.toFixed(2)} CHF`}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">💰</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Low Stock Alert Banner */}
                {stats.lowStockProducts > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 mb-1">
                          Niedriger Bestand Warnung
                        </h3>
                        <p className="text-sm text-red-700">
                          {stats.lowStockProducts} {stats.lowStockProducts === 1 ? 'Produkt hat' : 'Produkte haben'} einen niedrigen Bestand und sollten nachbestellt werden.
                          {stats.outOfStockProducts > 0 && (
                            <span className="ml-2">
                              {stats.outOfStockProducts} {stats.outOfStockProducts === 1 ? 'Produkt ist' : 'Produkte sind'} ausverkauft.
                            </span>
                          )}
                        </p>
                      </div>
                      <Link
                        href="/admin"
                        onClick={() => setActiveTab('products')}
                        className="text-sm font-medium text-red-700 hover:text-red-900 underline"
                      >
                        Produkte anzeigen
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'products' && (
              <ProductManagement 
                products={products} 
                loading={loading}
                onRefresh={() => {
                  fetchProducts();
                  fetchStats();
                }}
              />
            )}
            {activeTab === 'finance' && <FinanceManagement />}
          </div>
        </main>
      </div>
    </div>
  );
}

