'use client';

import { useState, useEffect, Fragment } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ProductProfitability {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  image: string | null;
  purchasePrice: number;
  sellPrice: number;
  stock: number;
  isActive: boolean;
  totalSold: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  profitPerUnit: number;
  profitMarginPerUnit: number;
}

interface FinanceStats {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  totalOrders: number;
  totalProducts: number;
  activeProducts: number;
}

export default function FinanceManagement() {
  const [products, setProducts] = useState<ProductProfitability[]>([]);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'profit' | 'revenue' | 'name'>('profit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailMessage, setTestEmailMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const [productsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/finance/products`),
        fetch(`${API_URL}/api/finance/stats`),
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const handleSort = (field: 'profit' | 'revenue' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sendTestEmail = async (type: 'success' | 'failed') => {
    try {
      setSendingTestEmail(true);
      setTestEmailMessage(null);
      
      const response = await fetch(`${API_URL}/api/finance/test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestEmailMessage({ type: 'success', message: data.message });
      } else {
        setTestEmailMessage({ type: 'error', message: data.error || 'Fehler beim Senden der Test-E-Mail' });
      }
    } catch (error) {
      setTestEmailMessage({ type: 'error', message: 'Fehler beim Senden der Test-E-Mail' });
    } finally {
      setSendingTestEmail(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'profit') {
      comparison = a.profit - b.profit;
    } else if (sortBy === 'revenue') {
      comparison = a.totalRevenue - b.totalRevenue;
    } else {
      comparison = a.name.localeCompare(b.name);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Finanzverwaltung</h2>
        <p className="text-slate-600">Übersicht über Produktprofitabilität und Finanzstatistiken</p>
      </div>

      {/* Test Email Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">E-Mail Templates testen</h3>
        <p className="text-sm text-slate-600 mb-4">
          Testen Sie die E-Mail-Templates. E-Mails werden an <strong>info@yanev-shop.ch</strong> gesendet.
        </p>
        
        {testEmailMessage && (
          <div className={`mb-4 p-4 rounded-lg ${
            testEmailMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {testEmailMessage.message}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => sendTestEmail('success')}
            disabled={sendingTestEmail}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingTestEmail ? 'Wird gesendet...' : '✓ Erfolgs-E-Mail senden'}
          </button>
          <button
            onClick={() => sendTestEmail('failed')}
            disabled={sendingTestEmail}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingTestEmail ? 'Wird gesendet...' : '✗ Fehler-E-Mail senden'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Gesamtumsatz</p>
            <p className="text-2xl font-semibold text-slate-900">CHF {stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Gesamtkosten</p>
            <p className="text-2xl font-semibold text-red-600">CHF {stats.totalCost.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Gesamtgewinn</p>
            <p className="text-2xl font-semibold text-green-600">CHF {stats.totalProfit.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Gewinnmarge</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.profitMargin.toFixed(2)}%</p>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Produktprofitabilität</h3>
          <p className="text-sm text-slate-600 mt-1">Klicken Sie auf ein Produkt, um Details zu sehen</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Produkt
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('revenue')}
                >
                  Umsatz
                  {sortBy === 'revenue' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Verkauft
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('profit')}
                >
                  Gewinn
                  {sortBy === 'profit' && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Marge
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedProducts.map((product) => {
                const isExpanded = expandedProducts.has(product.id);
                return (
                  <Fragment key={product.id}>
                    <tr
                      className={`hover:bg-slate-50 cursor-pointer ${!product.isActive ? 'opacity-60' : ''}`}
                      onClick={() => toggleProduct(product.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded border border-slate-200"
                            />
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{product.name}</p>
                            {product.sku && (
                              <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-slate-900">CHF {product.totalRevenue.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-slate-700">{product.totalSold}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${product.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          CHF {product.profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${product.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.profitMargin.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="text-slate-600 hover:text-slate-900">
                          {isExpanded ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Einkaufspreis</p>
                              <p className="text-lg font-semibold text-slate-900">CHF {product.purchasePrice.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Verkaufspreis</p>
                              <p className="text-lg font-semibold text-slate-900">CHF {product.sellPrice.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Gewinn pro Einheit</p>
                              <p className={`text-lg font-semibold ${product.profitPerUnit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                CHF {product.profitPerUnit.toFixed(2)}
                              </p>
                              <p className="text-xs text-slate-500">({product.profitMarginPerUnit.toFixed(2)}% Marge)</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Lagerbestand</p>
                              <p className={`text-lg font-semibold ${product.stock > 0 ? 'text-slate-900' : 'text-red-600'}`}>
                                {product.stock}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Gesamtkosten</p>
                                <p className="text-sm font-medium text-red-600">CHF {product.totalCost.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Gesamtumsatz</p>
                                <p className="text-sm font-medium text-slate-900">CHF {product.totalRevenue.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Gesamtgewinn</p>
                                <p className={`text-sm font-semibold ${product.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  CHF {product.profit.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedProducts.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <p>Keine Produkte gefunden</p>
          </div>
        )}
      </div>
    </div>
  );
}

