'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  userId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  stripePaymentId: string | null;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
  };
  items: OrderItem[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/orders/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      setOrder(data.order);
      setNewStatus(data.order.status);
      setTrackingNumber(data.order.shippingAddress?.trackingNumber || '');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Bestellung');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order || !newStatus) return;

    try {
      setUpdatingStatus(true);
      const response = await fetch(`${API_URL}/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          trackingNumber: trackingNumber || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      await fetchOrder(); // Refresh order data
      alert('Bestellstatus erfolgreich aktualisiert');
    } catch (err: any) {
      alert('Fehler beim Aktualisieren des Status: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'PENDING': 'Ausstehend',
      'PROCESSING': 'In Bearbeitung',
      'SHIPPED': 'Versandt',
      'DELIVERED': 'Geliefert',
      'CANCELLED': 'Storniert',
    };
    return labels[status] || status;
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

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return 'N/A';
    const labels: { [key: string]: string } = {
      'TWINT': 'TWINT',
      'APPLEPAY': 'Apple Pay',
      'CARD': 'Kreditkarte',
      'PAYPAL': 'PayPal',
      'CASH': 'Bar',
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Bestellung...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Bestellung nicht gefunden'}</p>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors inline-block"
          >
            Zurück zu Bestellungen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">P</span>
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
            <Link
              href="/admin"
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                pathname === '/admin'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg sm:text-xl">📦</span>
              <span className="font-medium text-sm sm:text-base">Produkte</span>
            </Link>
            <Link
              href="/admin/orders"
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                pathname?.startsWith('/admin/orders')
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg sm:text-xl">🛒</span>
              <span className="font-medium text-sm sm:text-base">Bestellungen</span>
            </Link>
            <Link
              href="/admin"
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                pathname === '/admin' && false
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg sm:text-xl">💰</span>
              <span className="font-medium text-sm sm:text-base">Finanzen</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/orders"
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                  {order.orderNumber}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                  order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Bestellte Artikel</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 truncate">{item.product.name}</h3>
                        <p className="text-sm text-slate-600">Menge: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">CHF {(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-slate-600">CHF {item.price.toFixed(2)} pro Stück</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Lieferadresse</h2>
                {order.shippingAddress ? (
                  <div className="space-y-1 text-slate-600">
                    <p className="font-medium text-slate-900">{order.shippingAddress.fullName || order.user.fullName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.zipCode} {order.shippingAddress.city}</p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.trackingNumber && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-sm font-medium text-slate-900">Tracking-Nummer:</p>
                        <p className="text-slate-600">{order.shippingAddress.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-600">Keine Lieferadresse angegeben</p>
                )}
              </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Bestellübersicht</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Bestellt am:</span>
                    <span className="text-slate-900 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('de-CH', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Zahlungsstatus:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                      order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Zahlungsmethode:</span>
                    <span className="text-slate-900 font-medium">{getPaymentMethodLabel(order.paymentMethod)}</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Preisübersicht</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Zwischensumme:</span>
                    <span className="text-slate-900">CHF {order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Versand:</span>
                    <span className="text-slate-900">CHF {order.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">MWST (7.7%):</span>
                    <span className="text-slate-900">CHF {order.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900">Gesamt:</span>
                      <span className="font-semibold text-slate-900 text-lg">CHF {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Kundeninformationen</h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-600">Name:</span>
                    <p className="text-slate-900 font-medium">{order.user.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">E-Mail:</span>
                    <p className="text-slate-900 font-medium">{order.user.email}</p>
                  </div>
                  {order.user.phone && (
                    <div>
                      <span className="text-slate-600">Telefon:</span>
                      <p className="text-slate-900 font-medium">{order.user.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Update Status */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Status aktualisieren</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Neuer Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    >
                      <option value="PENDING">Ausstehend</option>
                      <option value="PROCESSING">In Bearbeitung</option>
                      <option value="SHIPPED">Versandt</option>
                      <option value="DELIVERED">Geliefert</option>
                      <option value="CANCELLED">Storniert</option>
                    </select>
                  </div>
                  {newStatus === 'SHIPPED' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tracking-Nummer
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="z.B. CH123456789"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      />
                    </div>
                  )}
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus || newStatus === order.status}
                    className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus ? 'Wird aktualisiert...' : 'Status aktualisieren'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

