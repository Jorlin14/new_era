/**
 * ProtectedRouteDeliverer Component - New Era Supermercado
 * 
 * Componente que protege rutas del panel de domiciliarios.
 * Verifica que el usuario esté autenticado y tenga rol de DELIVERER.
 * 
 * @module components/deliverer/ProtectedRouteDeliverer
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/api-admin';

interface ProtectedRouteDelivererProps {
  children: React.ReactNode;
}

export default function ProtectedRouteDeliverer({ children }: ProtectedRouteDelivererProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    function checkAuth() {
      const authenticated = isAuthenticated();
      
      if (!authenticated) {
        console.log('❌ No autenticado - Redirigiendo a /auth');
        router.push('/auth');
        return;
      }

      const user = getCurrentUser();

      if (!user) {
        console.log('❌ No hay datos de usuario - Redirigiendo a /auth');
        router.push('/auth');
        return;
      }

      // Verificar que el usuario sea DELIVERER
      if (user.role !== 'DELIVERER') {
        console.log('❌ Usuario no es DELIVERER - Redirigiendo a /');
        router.push('/');
        return;
      }

      console.log('✅ Domiciliario autorizado:', user.name, `(${user.role})`);
      setIsAuthorized(true);
      setIsChecking(false);
    }

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1c6554] mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Verificando acceso...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
