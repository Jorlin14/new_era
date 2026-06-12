/**
 * Deliverer Tracking Page — New Era Supermercado
 *
 * Página de rastreo GPS para domiciliarios.
 * Carga LiveTracker dinámicamente para evitar errores SSR (window is not defined).
 *
 * @module app/deliverer/dashboard/tracking/page
 */

'use client';

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Carga dinámica sin SSR para evitar 'window is not defined' (Leaflet/Geolocation)
const LiveTracker = dynamic(
  () => import('@/components/deliverer/LiveTracker'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-[#1c6554] dark:border-t-green-400 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Cargando rastreo GPS...</p>
      </div>
    ),
  }
);

export default function TrackingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Orden no especificada
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            No se proporcionó un ID de orden para rastrear.
          </p>
          <Link
            href="/deliverer/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1c6554] to-[#0C447C] dark:from-green-600 dark:to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Mis Entregas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/deliverer/dashboard"
          className="text-slate-500 dark:text-slate-400 hover:text-[#1c6554] dark:hover:text-green-400 transition-colors"
        >
          Mis Entregas
        </Link>
        <span className="text-slate-400 dark:text-slate-600">/</span>
        <span className="text-slate-900 dark:text-white font-medium">Rastreo GPS</span>
      </div>

      {/* Componente LiveTracker */}
      <LiveTracker orderId={orderId} />
    </div>
  );
}
