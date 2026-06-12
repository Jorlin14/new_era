/**
 * Admin Layout - New Era Supermercado
 * 
 * Layout principal del dashboard de administración con sidebar profesional.
 * Incluye protección de rutas mediante ProtectedRoute.
 * 
 * Características:
 * - Sidebar colapsable
 * - Navegación con indicador de página activa
 * - Header con notificaciones
 * - Logout funcional
 * - Protección de rutas (solo ADMIN)
 * - Información del usuario autenticado
 * 
 * @module app/admin/layout
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import ThemeToggle from '@/components/ThemeToggle';
import { logout, getCurrentUser, getAllOrders } from '@/lib/api-admin';

/** Props del componente AdminLayout */
interface AdminLayoutProps {
  /** Contenido de las páginas hijas */
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  // Obtener datos del usuario al montar el componente
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Cargar notificaciones iniciales y configurar sondeo
    checkNewOrders();
    const interval = setInterval(checkNewOrders, 30000); // Cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  const checkNewOrders = async () => {
    try {
      const { data: orders } = await getAllOrders({ limit: 10 });
      
      // Filtrar órdenes de hoy o las últimas 10
      const newNotifications = orders.map((order: any) => ({
        id: order.id,
        title: 'Nuevo pedido',
        message: `${order.customer.name} ha realizado un pedido de ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(order.total)}`,
        time: new Date(order.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        unread: order.status === 'PENDING' || order.status === 'PAID',
        raw: order
      }));

      // Verificar si hay órdenes que no teníamos antes para sonar la alerta
      setNotifications(prev => {
        const hasNew = newNotifications.length > 0 && prev.length > 0 && newNotifications[0].id !== prev[0].id;
        if (hasNew) {
          playNotificationSound();
        }
        return newNotifications;
      });

      const unread = newNotifications.filter(n => n.unread).length;
      setUnreadCount(unread);

    } catch (error) {
      console.error('Error polling orders:', error);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.warn('No se pudo reproducir el sonido:', e));
  };


  /** Enlaces de navegación del sidebar */
  const navLinks = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: <DashboardIcon />,
    },
    {
      name: 'Pedidos',
      href: '/admin/orders',
      icon: <ShoppingBagIcon />,
    },
    {
      name: 'Productos',
      href: '/admin/products',
      icon: <ProductsIcon />,
    },
    {
      name: 'Categorías',
      href: '/admin/categories',
      icon: <CategoriesIcon />,
    },
    {
      name: 'Promociones',
      href: '/admin/promotions',
      icon: <PromotionsIcon />,
    },
    {
      name: 'Usuarios',
      href: '/admin/users',
      icon: <UsersIcon />,
    },
  ];

  /**
   * Cierra sesión del usuario tras confirmación en el modal.
   */
  const handleLogoutConfirm = () => {
    logout();
    router.push('/auth');
  };

  // Envolver todo el contenido en ProtectedRoute para verificar autenticación
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-page-enter">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-slate-900 dark:bg-slate-950 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo y toggle */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-slate-800 dark:border-slate-800">
          {isSidebarOpen && (
            <div className="flex items-center gap-2 pl-3">
              <Logo size="lg" />
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

        {/* Footer del sidebar con información del usuario */}
        {isSidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              {/* Avatar con iniciales del usuario */}
              <div className="w-10 h-10 bg-[#1c6554] flex items-center justify-center text-white font-bold text-sm">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'Administrador'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || 'admin@newera.com'}
                </p>
              </div>
            </div>
            {/* Link para volver a la tienda */}
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
            Panel de Administración
          </h1>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

             {/* Botón de notificaciones */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) setUnreadCount(0); // Limpiar visualmente al abrir
                }}
                className="relative p-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-[#b43232] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>


              {/* Dropdown de notificaciones */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                   <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg z-50 animate-fade-in rounded-xl">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Notificaciones</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 font-bold rounded-full">
                          {unreadCount} NUEVAS
                        </span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <NotificationItem
                            key={notif.id}
                            title={notif.title}
                            message={notif.message}
                            time={notif.time}
                            unread={notif.unread}
                            onClick={() => {
                              setShowNotifications(false);
                              router.push(`/admin/orders/${notif.id}`);
                            }}
                          />
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-500 text-sm">
                          No hay notificaciones recientes
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-center">
                      <Link 
                        href="/admin/orders"
                        onClick={() => setShowNotifications(false)}
                        className="text-sm text-[#1c6554] hover:text-[#1c6554]/80 font-medium"
                      >
                        Ver todos los pedidos
                      </Link>
                    </div>
                  </div>

                </>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

            {/* Botón de cerrar sesión */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogoutIcon />
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">{children}</main>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogoutIcon className="w-8 h-8 text-rose-500 dark:text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                ¿Cerrar sesión?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                ¿Estás seguro de que deseas salir del panel de administración?
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="cursor-pointer flex-1 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="cursor-pointer flex-1 px-4 py-2.5 bg-rose-500 text-white font-semibold hover:bg-rose-600 rounded-xl transition-colors shadow-lg shadow-rose-500/20"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </ProtectedRoute>
  );
}
/**
 * Item de notificación
 */
interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
  unread?: boolean;
  onClick?: () => void;
}

function NotificationItem({ title, message, time, unread, onClick }: NotificationItemProps) {
  return (
    <div 
      onClick={onClick}
      className={`px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 ${unread ? 'bg-slate-50/50 dark:bg-slate-700/30' : ''}`}
    >
      <div className="flex items-start gap-3">
        {unread && (
          <div className="w-2 h-2 bg-[#1c6554] rounded-full mt-2 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{message}</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{time}</p>
        </div>
      </div>
    </div>
  );
}
function DashboardIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
      />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

function PromotionsIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
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

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function LogoutIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
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
