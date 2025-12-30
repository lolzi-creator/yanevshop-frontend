'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: Array<{
    quantity: number;
    product: {
      name: string;
      image: string | null;
    };
  }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchOrders();
        // Refresh orders every 3 seconds to get updated payment statuses (only if there are pending payments)
        const interval = setInterval(() => {
          const hasPendingPayments = orders.some(order => order.paymentStatus === 'PENDING');
          if (hasPendingPayments) {
            fetchOrders(false); // Don't show loading spinner on refresh
          }
        }, 3000);
        return () => clearInterval(interval);
      }
    }
  }, [user, authLoading, orders.length]);

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await fetch(`${API_URL}/api/orders?userId=${user?.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Bestellungen');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'PENDING': 'Ausstehend',
      'PROCESSING': 'In Bearbeitung',
      'SHIPPED': 'Versendet',
      'DELIVERED': 'Geliefert',
      'CANCELLED': 'Storniert',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-700';
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20 md:pt-24 pb-12 md:pb-16">
          <div className="text-center">
            <div className="text-slate-600">Lädt Bestellungen...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20 md:pt-24 pb-12 md:pb-16">
          <div className="text-center px-4 sm:px-6 max-w-md">
            <h1 className="text-2xl sm:text-3xl font-semibold mb-4 text-slate-900">
              {error}
            </h1>
            <button
              onClick={fetchOrders}
              className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <div className="flex-grow py-8 sm:py-12 md:py-16 pt-20 sm:pt-24 md:pt-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Zurück zum Profil
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 mb-2">
              Meine Bestellungen
            </h1>
            <p className="text-sm text-slate-600">
              Übersicht aller Ihrer Bestellungen
            </p>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 md:p-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
                Noch keine Bestellungen
              </h2>
              <p className="text-slate-600 mb-6">
                Sie haben noch keine Bestellungen aufgegeben.
              </p>
              <Link
                href="/products"
                className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                Jetzt einkaufen
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left Side - Order Info */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
                        <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                          {order.orderNumber}
                        </h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <span>
                          {new Date(order.createdAt).toLocaleDateString('de-CH', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>{order.items.length} Artikel</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-900">
                          CHF {order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Right Side - Arrow */}
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

