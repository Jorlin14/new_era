/**
 * Auth Layout - New Era Supermercado
 * 
 * Layout wrapper para páginas de autenticación con transición suave de entrada.
 * 
 * @module app/auth/layout
 */

'use client';

export default function AuthRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-page-enter">
      {children}
    </div>
  );
}
