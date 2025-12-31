'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useEffect, useState, Suspense } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
}

function PaymentFailedPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex-grow py-8 sm:py-12 md:py-16 pt-36 sm:pt-40 md:pt-44 pb-12 sm:pb-16 md:pb-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          {/* Error Header */}
          <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6 sm:p-8 md:p-12 mb-6 sm:mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 text-slate-900">
              Zahlung fehlgeschlagen
            </h1>
            
            <p className="text-slate-600 mb-2">
              Ihre Zahlung konnte nicht verarbeitet werden
            </p>
            {order && (
              <p className="text-sm text-slate-500 mb-4">
                Bestellnummer: <span className="font-mono font-semibold">{order.orderNumber}</span>
              </p>
            )}
          </div>

          {/* Information */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-4">
              Was können Sie tun?
            </h2>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="text-slate-900 font-semibold">1.</span>
                <span>Überprüfen Sie Ihre Zahlungsmethode und versuchen Sie es erneut</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-900 font-semibold">2.</span>
                <span>Stellen Sie sicher, dass Ihr Konto über ausreichend Guthaben verfügt</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-slate-900 font-semibold">3.</span>
                <span>Kontaktieren Sie uns, wenn das Problem weiterhin besteht</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {order && (
              <Link
                href={`/checkout?retry=${order.id}`}
                className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-center"
              >
                Erneut versuchen
              </Link>
            )}
            <Link
              href="/orders"
              className="flex-1 sm:flex-none px-6 py-3 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium text-center"
            >
              Meine Bestellungen
            </Link>
            <Link
              href="/contact"
              className="flex-1 sm:flex-none px-6 py-3 border-2 border-slate-300 text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium text-center"
            >
              Kontakt
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}



export default function PaymentFailedPage() {
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
      <PaymentFailedPageContent />
    </Suspense>
  );
}
