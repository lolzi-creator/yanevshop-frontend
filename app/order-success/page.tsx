'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  items: OrderItem[];
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const paymentIntentId = searchParams.get('payment_intent');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    if (orderId) {
      // Always check payment status when coming back from redirect (TWINT, etc.)
      checkPaymentStatus();
    }
  }, [orderId]);

  const checkPaymentStatus = async () => {
    setCheckingPayment(true);
    setLoading(true);
    
    try {
      // Poll backend to check payment status (webhook might have updated it)
      let attempts = 0;
      const maxAttempts = 15; // 30 seconds total (15 * 2s)
      
      const checkInterval = setInterval(async () => {
        attempts++;
        try {
          const response = await fetch(`${API_URL}/api/orders/${orderId}`);
          if (response.ok) {
            const data = await response.json();
            const orderData = data.order;
            
            if (orderData.paymentStatus === 'PAID') {
              clearInterval(checkInterval);
              setOrder(orderData);
              setCheckingPayment(false);
              setLoading(false);
            } else if (orderData.paymentStatus === 'FAILED') {
              clearInterval(checkInterval);
              setCheckingPayment(false);
              setLoading(false);
              router.push(`/payment-failed?orderId=${orderId}`);
            } else if (attempts >= maxAttempts) {
              // Still pending after max attempts - might still be processing
              clearInterval(checkInterval);
              setCheckingPayment(false);
              // Show order but with pending status
              setOrder(orderData);
              setLoading(false);
            }
          }
        } catch (err) {
          console.error('Error checking payment status:', err);
        }
      }, 2000); // Check every 2 seconds
      
      // Also fetch order immediately (first check)
      const response = await fetch(`${API_URL}/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        const orderData = data.order;
        
        if (orderData.paymentStatus === 'PAID') {
          clearInterval(checkInterval);
          setOrder(orderData);
          setCheckingPayment(false);
          setLoading(false);
        } else if (orderData.paymentStatus === 'FAILED') {
          clearInterval(checkInterval);
          setCheckingPayment(false);
          setLoading(false);
          router.push(`/payment-failed?orderId=${orderId}`);
        }
        // If still pending, continue polling
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setCheckingPayment(false);
      fetchOrder();
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await response.json();
      const orderData = data.order;
      
      // If we're not checking payment status, verify payment
      if (!checkingPayment && orderData.paymentStatus !== 'PAID') {
        // Payment failed or pending - redirect to payment failed page
        router.push(`/payment-failed?orderId=${orderId}`);
        return;
      }
      
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Fehler beim Laden der Bestellung');
    } finally {
      if (!checkingPayment) {
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
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-700';
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return 'Nicht angegeben';
    const labels: { [key: string]: string } = {
      'TWINT': 'TWINT',
      'APPLEPAY': 'Apple Pay',
      'CARD': 'Kreditkarte',
      'PAYPAL': 'PayPal',
      'CASH': 'Bar',
    };
    return labels[method] || method;
  };

  if (loading || checkingPayment) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-20 md:pt-24 pb-12 md:pb-16">
          <div className="text-center">
            {checkingPayment ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                <div className="text-slate-600 mb-2">Zahlung wird verarbeitet...</div>
                <div className="text-sm text-slate-500">Bitte warten Sie, während wir Ihre Zahlung bestätigen.</div>
              </>
            ) : (
              <div className="text-slate-600">Lädt Bestellung...</div>
            )}
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
        <div className="flex-grow flex items-center justify-center pt-20 md:pt-24 pb-12 md:pb-16 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
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
      <div className="flex-grow py-8 sm:py-12 md:py-16 pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16 md:pb-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Success Header */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8 md:p-12 mb-6 sm:mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 text-slate-900">
              Bestellung erfolgreich!
            </h1>
            
            <p className="text-slate-600 mb-2">
              Vielen Dank für Ihre Bestellung bei Yanev Shop
            </p>
            <p className="text-sm text-slate-500">
              Eine Bestätigungs-E-Mail wurde an Sie gesendet
            </p>
          </div>

          {/* Order Overview */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                  Bestellnummer
                </h2>
                <p className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
                  {order.orderNumber}
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <span className={`inline-block px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
                <p className="text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString('de-CH', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
                Bestellte Artikel
              </h3>
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
                      <h4 className="font-medium text-slate-900 mb-1">{item.product.name}</h4>
                      <p className="text-sm text-slate-600 mb-2">Menge: {item.quantity}</p>
                      <p className="text-sm font-semibold text-slate-900">
                        CHF {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-slate-50 rounded-lg p-4 sm:p-6 mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
                Zusammenfassung
              </h3>
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
                  <span className="text-slate-600">MWST (7.7%)</span>
                  <span className="font-medium text-slate-900">CHF {order.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between text-base sm:text-lg">
                  <span className="font-semibold text-slate-900">Gesamt</span>
                  <span className="font-semibold text-slate-900">CHF {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Zahlungsmethode</h4>
                <p className="text-sm text-slate-900">{getPaymentMethodLabel(order.paymentMethod)}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Zahlungsstatus</h4>
                {order.paymentStatus === 'PAID' ? (
                  <p className="text-sm text-green-600 font-medium">✓ Bezahlt</p>
                ) : order.paymentStatus === 'PENDING' ? (
                  <p className="text-sm text-yellow-600 font-medium">⏳ Ausstehend</p>
                ) : (
                  <p className="text-sm text-red-600 font-medium">✗ Fehlgeschlagen</p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Lieferadresse</h4>
                <div className="text-sm text-slate-900 space-y-1">
                  {typeof order.shippingAddress === 'object' ? (
                    <>
                      <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>
                        {order.shippingAddress.zipCode} {order.shippingAddress.city}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </>
                  ) : (
                    <p>{order.shippingAddress}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/orders"
              className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-center"
            >
              Meine Bestellungen anzeigen
            </Link>
            <Link
              href="/products"
              className="flex-1 sm:flex-none px-6 py-3 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium text-center"
            >
              Weiter einkaufen
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
