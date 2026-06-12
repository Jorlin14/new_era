/**
 * Cashier Layout - New Era Supermercado
 * 
 * Layout principal del dashboard de cajeros.
 * Incluye protección de rutas y navegación específica para cajeros.
 * 
 * @module app/cashier/layout
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import ProtectedRouteCashier from '@/components/cashier/ProtectedRouteCashier';
import ThemeToggle from '@/components/ThemeToggle';
import { logout, getCurrentUser } from '@/lib/api-admin';

interface CashierLayoutProps {
  children: React.ReactNode;
}

export default function CashierLayout({ children }: CashierLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/cashier/dashboard',
      icon: <DashboardIcon />,
    },
    {
      name: 'Órdenes',
      href: '/cashier/orders',
      icon: <OrdersIcon />,
    },
    {
      name: 'Productos',
      href: '/cashier/products',
      icon: <ProductsIcon />,
    },
  ];

  const handleLogout = () => {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      logout();
      router.push('/auth');
    }
  };

  return (
    <ProtectedRouteCashier>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-page-enter">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-40 h-screen bg-slate-900 dark:bg-slate-950 transition-all duration-300 ${
            isSidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          {/* Logo y toggle */}
          <div className="flex items-center justify-between h-20 px-4 border-b border-slate-800">
            {isSidebarOpen && (
              <div className="flex items-center gap-2">
                <Logo size="md" />
              </div>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-slate-900 rounded-lg transition-colors"
              aria-label={isSidebarOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
            >
              <MenuIcon />
            </button>
          </div>

          {/* Navegación */}
          <nav className="py-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3.5 mb-1 transition-all ${
                    isActive
                      ? 'bg-[#1c6554] text-white border-l-4 border-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
                  }`}
                >
                  <span className="w-6 h-6 flex-shrink-0">{link.icon}</span>
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">{link.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer del sidebar */}
          {isSidebarOpen && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1c6554] flex items-center justify-center text-white font-bold text-sm">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'CA'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'Cajero'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || 'cajero@newera.com'}
                  </p>
                </div>
              </div>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <BackIcon />
                Volver a la tienda
              </Link>
            </div>
          )}
        </aside>

        {/* Main content */}
        <div
          className={`transition-all duration-300 ${
            isSidebarOpen ? 'ml-64' : 'ml-20'
          }`}
        >
          {/* Header */}
          <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Panel de Caja
            </h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogoutIcon />
                Cerrar sesión
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="p-8">{children}</main>
        </div>
      </div>
    </ProtectedRouteCashier>
  );
}
function DashboardIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}
