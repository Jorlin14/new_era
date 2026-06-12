/**
 * ProtectedRoute Component - New Era Supermercado
 * 
 * Componente de orden superior (HOC) que protege rutas del panel de administración.
 * Verifica que el usuario esté autenticado y tenga rol de ADMIN.
 * 
 * Características:
 * - Verifica token JWT en localStorage
 * - Valida rol de usuario (debe ser ADMIN)
 * - Redirecciona a /auth si no autenticado
 * - Muestra spinner mientras verifica autenticación
 * - Manejo de estados de carga
 * 
 * @module components/admin/ProtectedRoute
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/api-admin';

/** Props del componente ProtectedRoute */
interface ProtectedRouteProps {
  /** Componentes hijos a renderizar si está autenticado */
  children: React.ReactNode;
}

/**
 * Componente que protege rutas administrativas.
 * 
 * Verifica autenticación y rol ADMIN antes de mostrar contenido.
 * Redirige a la página de login si no está autenticado o no es admin.
 * 
 * @param {ProtectedRouteProps} props - Propiedades del componente
 * @returns {JSX.Element | null} Contenido protegido o spinner de carga
 * 
 * @example
 * // En una página de admin
 * export default function AdminPage() {
 *   return (
 *     <ProtectedRoute>
 *       <div>Contenido solo para admins</div>
 *     </ProtectedRoute>
 *   );
 * }
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    /**
     * Verifica la autenticación y autorización del usuario.
     * 
     * Proceso:
     * 1. Verifica si existe token JWT
     * 2. Obtiene datos del usuario desde localStorage
     * 3. Valida que el rol sea ADMIN
     * 4. Redirecciona si no cumple los requisitos
     */
    function checkAuth() {
      // Verificar si hay token de autenticación
      const authenticated = isAuthenticated();
      
      if (!authenticated) {
        // No hay token, redirigir a login
        console.log('❌ No autenticado - Redirigiendo a /auth');
        router.push('/auth');
        return;
      }

      // Obtener datos del usuario
      const user = getCurrentUser();

      if (!user) {
        // Token existe pero no hay datos de usuario, redirigir
        console.log('❌ No hay datos de usuario - Redirigiendo a /auth');
        router.push('/auth');
        return;
      }

      // Verificar que el usuario sea ADMIN
      if (user.role !== 'ADMIN') {
        // Usuario autenticado pero no es admin, redirigir al home
        console.log('❌ Usuario no es ADMIN - Redirigiendo a /');
        router.push('/');
        return;
      }

      // Usuario autenticado y autorizado
      console.log('✅ Usuario autorizado:', user.name, `(${user.role})`);
      setIsAuthorized(true);
      setIsChecking(false);
    }

    checkAuth();
  }, [router]);

  // Mostrar spinner mientras verifica autenticación
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          {/* Spinner animado */}
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1c6554] mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Verificando acceso...
          </p>
        </div>
      </div>
    );
  }

  // No renderizar nada si no está autorizado (ya se redirigió)
  if (!isAuthorized) {
    return null;
  }

  // Usuario autorizado, mostrar contenido
  return <>{children}</>;
}
