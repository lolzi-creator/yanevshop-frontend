'use client';

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

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = filterStatus 
        ? `${API_URL}/api/orders?status=${filterStatus}`
        : `${API_URL}/api/orders`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Bestellungen');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      setSelectedOrder(data.order);
      setNewStatus(data.order.status);
      setTrackingNumber(data.order.shippingAddress?.trackingNumber || '');
      setShowOrderModal(true);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Bestellung');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      setUpdatingStatus(true);
      const response = await fetch(`${API_URL}/api/orders/${selectedOrder.id}/status`, {
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
        throw new Error('Failed to update status');
      }

      await fetchOrders();
      setShowOrderModal(false);
      setSelectedOrder(null);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Aktualisieren');
    } finally {
      setUpdatingStatus(false);
    }
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

  const getPaymentStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'PENDING': 'Ausstehend',
      'PAID': 'Bezahlt',
      'FAILED': 'Fehlgeschlagen',
      'REFUNDED': 'Erstattet',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Bestellverwaltung</h2>
          <p className="text-slate-600">Verwalten Sie alle Bestellungen und deren Status</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Lädt Bestellungen...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Bestellverwaltung</h2>
        <p className="text-slate-600">Verwalten Sie alle Bestellungen und deren Status</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 md:px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm md:text-base"
          >
            <option value="">Alle Status</option>
            <option value="PENDING">Ausstehend</option>
            <option value="PROCESSING">In Bearbeitung</option>
            <option value="SHIPPED">Versendet</option>
            <option value="DELIVERED">Geliefert</option>
            <option value="CANCELLED">Storniert</option>
          </select>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            Aktualisieren
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900">Bestellnummer</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 hidden md:table-cell">Kunde</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900">Artikel</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 hidden lg:table-cell">Gesamt</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900">Status</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900 hidden sm:table-cell">Zahlung</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900">Datum</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-900">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    Keine Bestellungen gefunden
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-900 font-medium text-xs sm:text-sm font-mono">
                      {order.orderNumber}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-600 text-xs sm:text-sm hidden md:table-cell">
                      {order.user.fullName || order.user.email}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-600 text-xs sm:text-sm">
                      {order.items.length} Artikel
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-900 font-medium text-xs sm:text-sm hidden lg:table-cell">
                      {order.total.toFixed(2)} CHF
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-slate-600 text-xs sm:text-sm">
                      {new Date(order.createdAt).toLocaleDateString('de-CH', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
                      >
                        Anzeigen
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Bestellung {selectedOrder.orderNumber}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {new Date(selectedOrder.createdAt).toLocaleString('de-CH')}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Kundeninformationen</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">Name:</span>
                    <span className="ml-2 text-slate-900 font-medium">
                      {selectedOrder.user.fullName || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">E-Mail:</span>
                    <span className="ml-2 text-slate-900 font-medium">{selectedOrder.user.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Telefon:</span>
                    <span className="ml-2 text-slate-900 font-medium">
                      {selectedOrder.user.phone || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Lieferadresse</h4>
                  <div className="text-sm text-slate-900">
                    {typeof selectedOrder.shippingAddress === 'object' ? (
                      <div>
                        <p>{selectedOrder.shippingAddress.address}</p>
                        <p>
                          {selectedOrder.shippingAddress.zipCode} {selectedOrder.shippingAddress.city}
                        </p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                        {selectedOrder.shippingAddress.trackingNumber && (
                          <p className="mt-2 font-mono text-blue-600">
                            Tracking: {selectedOrder.shippingAddress.trackingNumber}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p>{selectedOrder.shippingAddress}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Bestellte Artikel</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                      {item.product.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded border border-slate-200"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.product.name}</p>
                        <p className="text-sm text-slate-600">Menge: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-slate-900">
                        {(item.price * item.quantity).toFixed(2)} CHF
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Zusammenfassung</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Zwischensumme:</span>
                    <span className="text-slate-900 font-medium">{selectedOrder.subtotal.toFixed(2)} CHF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Versand:</span>
                    <span className="text-slate-900 font-medium">{selectedOrder.shipping.toFixed(2)} CHF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">MWST (7.7%):</span>
                    <span className="text-slate-900 font-medium">{selectedOrder.tax.toFixed(2)} CHF</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-900">Gesamt:</span>
                    <span className="font-semibold text-slate-900 text-lg">{selectedOrder.total.toFixed(2)} CHF</span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-semibold text-slate-900 mb-3">Status ändern</h4>
                <div className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  >
                    <option value="PENDING">Ausstehend</option>
                    <option value="PROCESSING">In Bearbeitung</option>
                    <option value="SHIPPED">Versendet</option>
                    <option value="DELIVERED">Geliefert</option>
                    <option value="CANCELLED">Storniert</option>
                  </select>

                  {newStatus === 'SHIPPED' && (
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Tracking-Nummer"
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  )}

                  <button
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus || newStatus === selectedOrder.status}
                    className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus ? 'Wird aktualisiert...' : 'Status aktualisieren'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
