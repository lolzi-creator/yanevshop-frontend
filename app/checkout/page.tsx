'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Initialize Stripe
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

// Payment Form Component (inside Stripe Elements)
function CheckoutForm({ clientSecret, orderId, total, onSuccess }: { clientSecret: string; orderId: string; total: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePaymentSuccess = async (paymentIntent: any, paymentMethod?: string) => {
    try {
      // Detect payment method if not provided
      let detectedPaymentMethod = paymentMethod || 'CARD';
      
      if (!paymentMethod && paymentIntent.charges?.data?.[0]?.payment_method_details) {
        const chargeDetails = paymentIntent.charges.data[0].payment_method_details;
        if (chargeDetails.type === 'twint') {
          detectedPaymentMethod = 'TWINT';
        } else if (chargeDetails.type === 'card') {
          detectedPaymentMethod = 'CARD';
        }
      }

      const updateResponse = await fetch(`${API_URL}/api/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus: 'PAID',
          stripePaymentId: paymentIntent.id,
          paymentMethod: detectedPaymentMethod,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('Failed to update order payment status:', errorData);
        throw new Error('Failed to update order');
      } else {
        console.log('Order payment status updated successfully');
      }
      
      // Payment succeeded - redirect to success page
      onSuccess();
    } catch (updateError) {
      console.error('Failed to update order payment status:', updateError);
      setError('Zahlung erfolgreich, aber Fehler beim Aktualisieren der Bestellung. Bitte kontaktieren Sie uns.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // IMPORTANT: Submit elements first before confirming payment
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setError(submitError.message || 'Fehler bei der Validierung');
        setLoading(false);
        return;
      }

      // Confirm payment after elements are submitted
      // For TWINT and other redirect-based methods, Stripe will redirect automatically
      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order-success?orderId=${orderId}`,
        },
        redirect: 'always', // Always redirect for TWINT and other redirect-based payment methods
      });

      // If we get here without redirect, it means payment was immediate (card without 3D Secure)
      // In this case, we handle it directly

      if (result.error) {
        const stripeError = result.error;
        setError(stripeError.message || 'Zahlung fehlgeschlagen');
        setLoading(false);
        
        // Update order payment status to FAILED
        try {
          await fetch(`${API_URL}/api/orders/${orderId}/payment`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentStatus: 'FAILED',
            }),
          });
        } catch (updateError) {
          console.error('Failed to update order payment status to FAILED:', updateError);
        }
        return;
      }

      // Type guard: check if result has paymentIntent
      // If paymentIntent is null, it means Stripe redirected (TWINT, 3D Secure, etc.)
      // The user will be redirected back to order-success page
      if (!('paymentIntent' in result) || !result.paymentIntent) {
        // Payment is being processed via redirect - user will be redirected
        return;
      }

      const paymentIntent = result.paymentIntent as any; // Type assertion needed due to Stripe types

      // Handle different payment statuses
      if (paymentIntent.status === 'succeeded') {
        // Payment succeeded - update order payment status immediately
        // Get the actual payment method used from Stripe
        let paymentMethod = 'CARD'; // Default
        
        // Try to get payment method from payment intent charges (most reliable)
        if (paymentIntent.charges?.data?.[0]?.payment_method_details) {
          const chargeDetails = paymentIntent.charges.data[0].payment_method_details;
          if (chargeDetails.type === 'twint') {
            paymentMethod = 'TWINT';
          } else if (chargeDetails.type === 'card') {
            paymentMethod = 'CARD';
          }
        }
        
        // Note: Payment method detection from client-side is limited
        // The backend webhook will handle accurate payment method detection
        
        console.log('Detected payment method:', paymentMethod, 'from payment intent:', paymentIntent);
        
        // Update order and redirect
        await handlePaymentSuccess(paymentIntent, paymentMethod);
      } else if (paymentIntent.status === 'requires_payment_method' || 
                 paymentIntent.status === 'canceled') {
        // Payment failed or requires action
        setError('Die Zahlung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.');
        setLoading(false);
        
        // Update order payment status to FAILED
        try {
          await fetch(`${API_URL}/api/orders/${orderId}/payment`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentStatus: 'FAILED',
            }),
          });
        } catch (updateError) {
          console.error('Failed to update order payment status to FAILED:', updateError);
        }
      } else {
        // Other statuses - redirect will handle it
        // User will be redirected to order-success page
      }
    } catch (err: any) {
      setError(err.message || 'Fehler bei der Zahlung');
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-600">Zahlung wird vorbereitet...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['twint', 'card'],
        }}
      />
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Wird verarbeitet...' : `Jetzt bezahlen - CHF ${total.toFixed(2)}`}
      </button>
    </form>
  );
}

// Main Checkout Page
function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, cartTotal, clearCart, addToCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoringCart, setRestoringCart] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Schweiz',
  });

  // Handle retry: restore cart from failed order
  useEffect(() => {
    const retryOrderId = searchParams.get('retry');
    if (retryOrderId && cart.length === 0) {
      restoreCartFromOrder(retryOrderId);
    }
  }, [searchParams]);

  const restoreCartFromOrder = async (orderId: string) => {
    setRestoringCart(true);
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        const order = data.order;
        
        // Restore cart items from order
        if (order.items && order.items.length > 0) {
          // Clear cart first to avoid duplicates
          clearCart();
          
          // Restore items with correct quantities
          // We'll add each item and then update its quantity
          order.items.forEach((item: any, index: number) => {
            if (item.product) {
              // Add item first (adds with quantity 1)
              addToCart({
                id: item.product.id,
                name: item.product.name,
                price: item.price,
                image: item.product.image || '',
              });
              
              // Update to correct quantity after a short delay
              // This ensures the item is added before we update quantity
              setTimeout(() => {
                updateQuantity(item.product.id, item.quantity);
              }, index * 20 + 20); // Stagger updates slightly
            }
          });
        }

        // Restore form data from shipping address
        if (order.shippingAddress && typeof order.shippingAddress === 'object') {
          setFormData({
            firstName: order.shippingAddress.firstName || '',
            lastName: order.shippingAddress.lastName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: order.shippingAddress.address || '',
            city: order.shippingAddress.city || '',
            zipCode: order.shippingAddress.zipCode || '',
            country: order.shippingAddress.country || 'Schweiz',
          });
        }
      }
    } catch (error) {
      console.error('Error restoring cart from order:', error);
    } finally {
      setRestoringCart(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        setError('Bitte melden Sie sich an, um eine Bestellung aufzugeben');
        setLoading(false);
        return;
      }

      // No VAT/MWST
      const FREE_SHIPPING_THRESHOLD = 50;
      const tax = 0;
      const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 8; // Free shipping over 50 CHF, otherwise 8 CHF
      const total = cartTotal + tax + shipping;

      // Create order
      const orderData = {
        userId: user.id,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod: 'CARD', // Will be updated by Stripe
      };

      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Erstellen der Bestellung');
      }

      const data = await response.json();
      setOrderId(data.order.id);
      
      // Create payment intent
      try {
        const paymentResponse = await fetch(`${API_URL}/api/payments/create-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId: data.order.id }),
        });

        if (!paymentResponse.ok) {
          throw new Error('Failed to create payment intent');
        }

        const paymentData = await paymentResponse.json();
        setClientSecret(paymentData.clientSecret);
        setStep('payment');
      } catch (paymentErr: any) {
        setError(paymentErr.message || 'Fehler beim Erstellen der Zahlung');
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Erstellen der Bestellung');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    router.push(`/order-success?orderId=${orderId}`);
  };

  if (restoringCart) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-36 sm:pt-40 md:pt-44 pb-12 sm:pb-16 md:pb-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="text-center px-4 sm:px-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <div className="text-slate-600">Warenkorb wird wiederhergestellt...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-36 sm:pt-40 md:pt-44 pb-12 sm:pb-16 md:pb-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="text-center px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight mb-4 sm:mb-6 text-slate-900">
              Ihr Warenkorb ist leer
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mb-8 sm:mb-10 md:mb-12">
              Fügen Sie Produkte hinzu, bevor Sie zur Kasse gehen
            </p>
            <Link
              href="/products"
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Produkte durchsuchen
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const FREE_SHIPPING_THRESHOLD = 50;
  const tax = 0; // No VAT/MWST
  const shipping: number = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 8; // Free shipping over 50 CHF, otherwise 8 CHF
  const total = cartTotal + tax + shipping;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <div className="flex-grow py-8 sm:py-12 md:py-16 pt-36 sm:pt-40 md:pt-44 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-6 sm:mb-8 md:mb-12 text-slate-900">
            Kasse
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {/* Left Side - Form or Payment */}
            <div className="lg:col-span-2">
              {step === 'form' ? (
                <form onSubmit={handleFormSubmit} className="space-y-6 md:space-y-8">
                  {/* Personal Information */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-slate-900">
                      Persönliche Informationen
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Vorname *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Nachname *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          E-Mail *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Telefon *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-slate-900">
                      Lieferadresse
                    </h2>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Adresse *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 transition-all"
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Stadt *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            PLZ *
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Land *
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 sm:py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-900 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Wird erstellt...' : 'Weiter zur Zahlung'}
                  </button>
                </form>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-slate-900">
                    Zahlung
                  </h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Wählen Sie Ihre bevorzugte Zahlungsmethode: TWINT, Apple Pay oder Kreditkarte
                  </p>
                  {!stripePromise ? (
                    <div className="text-center py-8 text-slate-600">
                      Stripe ist nicht konfiguriert. Bitte fügen Sie NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY hinzu.
                    </div>
                  ) : !clientSecret ? (
                    <div className="text-center py-8">
                      <div className="text-slate-600">Zahlung wird vorbereitet...</div>
                    </div>
                  ) : (
                    <Elements 
                      stripe={stripePromise} 
                      options={{ 
                        clientSecret,
                        locale: 'de',
                        appearance: {
                          theme: 'stripe',
                        },
                      }}
                    >
                      <CheckoutForm clientSecret={clientSecret} orderId={orderId!} total={total} onSuccess={handlePaymentSuccess} />
                    </Elements>
                  )}
                </div>
              )}
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm sticky top-24">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-slate-900">
                  Bestellübersicht
                </h2>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-200 last:border-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                      />
                      <div className="flex-grow min-w-0">
                        <h4 className="font-medium text-sm text-slate-900 mb-1 line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500 mb-1">Menge: {item.quantity}</p>
                        <p className="text-sm font-semibold text-slate-900">
                          CHF {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 border-t border-slate-200 pt-4 sm:pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Zwischensumme</span>
                    <span className="font-medium text-slate-900">CHF {cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Versand</span>
                    {shipping === 0 ? (
                      <span className="font-medium text-green-600">Kostenlos</span>
                    ) : (
                      <span className="font-medium text-slate-900">CHF {shipping.toFixed(2)}</span>
                    )}
                  </div>
                  {shipping > 0 && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-lg text-xs">
                      <p className="text-slate-600">
                        Noch <strong className="text-slate-900">{remainingForFreeShipping.toFixed(2)} CHF</strong> für kostenlosen Versand!
                      </p>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-3 sm:pt-4 flex justify-between text-base sm:text-lg">
                    <span className="font-semibold text-slate-900">Gesamt</span>
                    <span className="font-semibold text-slate-900">CHF {total.toFixed(2)}</span>
                  </div>
                </div>

                {step === 'payment' && (
                  <Link
                    href="/cart"
                    className="block w-full text-center px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                  >
                    Zurück zum Warenkorb
                  </Link>
                )}

                {/* Security Badge */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Sichere Zahlung</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-grow flex items-center justify-center pt-36 sm:pt-40 md:pt-44 pb-12 sm:pb-16 md:pb-20">
          <div className="text-center px-4 sm:px-6">
            <div className="text-slate-600">Lädt...</div>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
