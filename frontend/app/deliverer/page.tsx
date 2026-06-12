/**
 * Deliverer Root Page - New Era Supermercado
 * 
 * Página raíz que redirige a /deliverer/dashboard
 * 
 * @module app/deliverer/page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DelivererPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/deliverer/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1c6554]"></div>
    </div>
  );
}
