/**
 * Cashier Dashboard Page - New Era Supermercado
 * 
 * Dashboard principal para cajeros con estadísticas del día.
 * 
 * @module app/cashier/dashboard/page
 */

'use client';

import { useState, useEffect } from 'react';
import { getAllOrders } from '@/lib/api-admin';
import { getCurrentUser } from '@/lib/api-admin';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedToday: number;
}

export default function CashierDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Cargar todas las órdenes
      const { data: allOrders } = await getAllOrders({});
      
      // Calcular estadísticas
      const totalRevenue = allOrders.reduce(
        (sum: number, order: any) => sum + Number(order.total),
        0
      );
      
      const pendingOrders = allOrders.filter(
        (order: any) => ['PENDING', 'PAID', 'PREPARING'].includes(order.status)
      ).length;
      
      // Órdenes completadas hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const completedToday = allOrders.filter((order: any) => {
        if (order.status !== 'DELIVERED') return false;
        const deliveredDate = new Date(order.deliveredAt || order.updatedAt);
        return deliveredDate >= today;
      }).length;
      
      setStats({
        totalOrders: allOrders.length,
        totalRevenue,
        pendingOrders,
        completedToday,
      });
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
      alert(error.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Bienvenido, {user?.name || 'Cajero'}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Resumen del día y estadísticas generales
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1c6554]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Órdenes"
            value={stats.totalOrders.toString()}
            icon={<OrdersIcon />}
            color="blue"
          />
          <StatsCard
            title="Ingresos Totales"
            value={formatCurrency(stats.totalRevenue)}
            icon={<MoneyIcon />}
            color="green"
          />
          <StatsCard
            title="Órdenes Pendientes"
            value={stats.pendingOrders.toString()}
            icon={<PendingIcon />}
            color="orange"
          />
          <StatsCard
            title="Entregadas Hoy"
            value={stats.completedToday.toString()}
            icon={<CheckIcon />}
            color="purple"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="w-2 h-2 bg-[#1c6554] rounded-full animate-pulse"></span>
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionButton
            href="/cashier/orders"
            icon={<OrdersIcon />}
            title="Ver Órdenes"
            description="Gestionar pedidos pendientes"
          />
          <QuickActionButton
            href="/cashier/products"
            icon={<ProductsIcon />}
            title="Consultar Productos"
            description="Ver catálogo y precios"
          />
          <QuickActionButton
            href="/cashier/orders?status=PENDING"
            icon={<PendingIcon />}
            title="Pendientes de Pago"
            description="Procesar pagos"
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-l-4 border-blue-500 dark:border-blue-600 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <InfoIcon />
          <div>
            <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Información del Sistema</h4>
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              Como cajero, puedes ver y gestionar órdenes, consultar productos,
              y actualizar estados de pedidos. Para más ayuda, contacta al administrador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3">{value}</p>
        </div>
        <div className={`w-14 h-14 ${colors[color]} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function QuickActionButton({ href, icon, title, description }: QuickActionButtonProps) {
  return (
    <a
      href={href}
      className="flex items-start gap-4 p-5 border-2 border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#1c6554] hover:shadow-lg transition-all duration-300 group bg-white dark:bg-slate-900"
    >
      <div className="p-3 bg-gradient-to-br from-[#1c6554] to-[#0C447C] text-white rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-md">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-[#1c6554] transition-colors">{title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
    </a>
  );
}
function OrdersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  );
}
