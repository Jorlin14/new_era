/**
 * Wompi Widget Component — New Era Supermercado
 * 
 * Este componente carga el script del checkout de Wompi y maneja 
 * el proceso de pago para una orden específica.
 * 
 * @module components/WompiWidget
 */

'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

interface WompiWidgetProps {
  orderId: string;
  amountInCents: number;
  signature: string;
  publicKey: string;
  customerEmail: string;
  customerName: string;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
  onClose: () => void;
}

export default function WompiWidget({
  orderId,
  amountInCents,
  signature,
  publicKey,
  customerEmail,
  customerName,
  onSuccess,
  onError,
  onClose,
}: WompiWidgetProps) {
  const [scriptLoaded, setScriptLoaded] = useState(() => {
    if (typeof window !== 'undefined' && (window as any).WidgetCheckout) {
      return true;
    }
    return false;
  });

  // El widget de Wompi se puede invocar programáticamente si se desea más control,
  // pero la forma más sencilla es usar el formulario que ellos proveen o
  // dispararlo manualmente tras cargar el script.
  
  const openWompiWidget = () => {
    if (!(window as any).WidgetCheckout) {
      console.error('El script de Wompi no se ha cargado correctamente.');
      return;
    }

    console.log('Abriendo Wompi Widget con:', {
      amountInCents,
      reference: orderId,
      publicKey,
      integrity: signature
    });

    const checkout = new (window as any).WidgetCheckout({
      currency: 'COP',
      amountInCents: amountInCents,
      reference: orderId,
      publicKey: publicKey,
      signature: { integrity: signature },
      customerData: {
        email: customerEmail,
        fullName: customerName,
      },
    });


    checkout.open((result: any) => {
      const transaction = result.transaction;
      
      if (transaction.status === 'APPROVED') {
        onSuccess(transaction);
      } else if (transaction.status === 'DECLINED' || transaction.status === 'ERROR') {
        onError(transaction);
      } else {
        // Otros estados como VOIDED o PENDING (en PSE por ejemplo)
        onClose();
      }
    });
  };

  useEffect(() => {
    if (scriptLoaded) {
      openWompiWidget();
    }
  }, [scriptLoaded]);

  return (
    <>
      <Script
        src="https://checkout.wompi.co/widget.js"
        onLoad={() => setScriptLoaded(true)}
      />
      
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
          <div className="mb-6">
            {!scriptLoaded ? (
              <>
                <div className="w-16 h-16 border-4 border-[#1c6554] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Conectando con Wompi
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Estamos preparando tu pasarela de pago segura...
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Pago en proceso
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Completa tu pago en la ventana segura de Wompi. Si la cerraste, haz clic abajo.
                </p>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors"
          >
            Cerrar ventana de pago
          </button>
        </div>
      </div>
    </>
  );
}
