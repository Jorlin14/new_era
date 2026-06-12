/**
 * Cashier Root Page - New Era Supermercado
 * 
 * Página raíz que redirige a /cashier/dashboard
 * 
 * @module app/cashier/page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CashierPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cashier/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1c6554]"></div>
    </div>
  );
}
