'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && user) {
      fetchOrder();
      // Refresh order every 2 seconds to get updated payment status (only if payment is still pending)
      const interval = setInterval(() => {
        if (order && order.paymentStatus === 'PENDING') {
          fetchOrder(false); // Don't show loading spinner on refresh
        }
      }, 2000);
      return () => clearInterval(interval);
    } else if (!user) {
      router.push('/login');
    }
  }, [id, user, order?.paymentStatus]);

  const fetchOrder = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await fetch(`${API_URL}/api/orders/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      
      // Check if order belongs to current user
      if (data.order.userId !== user?.id) {
        setError('Sie haben keine Berechtigung, diese Bestellung anzuzeigen');
        return;
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Bestellung');
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

  const getPaymentStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'PENDING': 'Ausstehend',
      'PAID': 'Bezahlt',
      'FAILED': 'Fehlgeschlagen',
      'REFUNDED': 'Erstattet',
    };
    return labels[status] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      case 'REFUNDED':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20 md:pt-24 pb-12 md:pb-16">
          <div className="text-center">
            <div className="text-slate-600">Lädt Bestellung...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20 md:pt-24 pb-12 md:pb-16">
          <div className="text-center px-4 sm:px-6 max-w-md">
            <h1 className="text-2xl sm:text-3xl font-semibold mb-4 text-slate-900">
              {error || 'Bestellung nicht gefunden'}
            </h1>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Zur Startseite
            </Link>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Zurück zur Startseite
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 mb-2">
              Bestellung {order.orderNumber}
            </h1>
            <p className="text-sm text-slate-600">
              Bestellt am {new Date(order.createdAt).toLocaleDateString('de-CH', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-slate-600 mb-2">Bestellstatus</p>
              <span className={`inline-block px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-slate-600 mb-2">Zahlungsstatus</p>
              <span className={`inline-block px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                {getPaymentStatusLabel(order.paymentStatus)}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">
              Bestellte Artikel
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 mb-1">{item.product.name}</h3>
                    <p className="text-sm text-slate-600 mb-2">Menge: {item.quantity}</p>
                    <p className="text-sm font-semibold text-slate-900">
                      CHF {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">
                Lieferadresse
              </h2>
              <div className="text-sm text-slate-700 space-y-1">
                {typeof order.shippingAddress === 'object' ? (
                  <>
                    <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.zipCode} {order.shippingAddress.city}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.trackingNumber && (
                      <p className="mt-3 pt-3 border-t border-slate-200">
                        <span className="font-medium">Tracking-Nummer:</span>{' '}
                        <span className="font-mono text-blue-600">{order.shippingAddress.trackingNumber}</span>
                      </p>
                    )}
                  </>
                ) : (
                  <p>{order.shippingAddress}</p>
                )}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4 sm:mb-6">
              Zusammenfassung
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Zwischensumme</span>
                <span className="font-medium text-slate-900">CHF {order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Versand</span>
                <span className="font-medium text-slate-900">CHF {order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-base sm:text-lg">
                <span className="font-semibold text-slate-900">Gesamt</span>
                <span className="font-semibold text-slate-900">CHF {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

