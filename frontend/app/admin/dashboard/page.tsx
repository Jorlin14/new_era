/**
 * Admin Dashboard Page - New Era Supermercado
 * 
 * Página principal del dashboard con estadísticas generales:
 * - Ventas totales
 * - Productos vendidos
 * - Usuarios registrados
 * - Pedidos activos
 * - Gráficas y métricas
 * 
 * @module app/admin/dashboard/page
 */

'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/lib/api-admin';
import { getProducts } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    activeOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [weeklySales, setWeeklySales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data } = await getDashboardStats();
      
      setStats({
        totalSales: data.totalSales,
        totalOrders: data.totalOrders,
        totalUsers: data.totalUsers,
        activeOrders: data.activeOrders,
      });
      setWeeklySales(data.weeklySales);
      setTopProducts(data.topProducts);
      setRecentOrders(data.recentOrders);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos del dashboard');
      console.error('Error loading dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c6554] mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-4">
        <p className="text-red-800 dark:text-red-300">Error: {error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Resumen general de tu tienda en tiempo real
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas Totales"
          value={formatPrice(stats.totalSales)}
          subtitle="Este mes"
          icon={<MoneyIcon />}
          trend="+12.5%"
          trendUp
        />
        <StatCard
          title="Pedidos"
          value={stats.totalOrders.toString()}
          subtitle="Este mes"
          icon={<OrdersIcon />}
          trend="+8.2%"
          trendUp
        />
        <StatCard
          title="Usuarios"
          value={stats.totalUsers.toString()}
          subtitle="Total registrados"
          icon={<UsersIcon />}
          trend="+23"
          trendUp
        />
        <StatCard
          title="Pedidos Activos"
          value={stats.activeOrders.toString()}
          subtitle="Pendientes de entrega"
          icon={<ActiveIcon />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas Semanales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#1c6554] rounded-full"></span>
            Ventas de la Semana
          </h3>
          <div className="h-64 flex items-end justify-between gap-3">
            {weeklySales.length === 0 ? (
              <p className="text-sm text-slate-500 w-full text-center pb-10">Sin datos esta semana</p>
            ) : weeklySales.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-[#1c6554] to-[#0C447C] rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative group"
                  style={{ height: `${item.value}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
                    {formatPrice(item.rawValue)}
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-1 group-hover:text-[#1c6554] transition-colors">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Productos Más Vendidos */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#0C447C] rounded-full"></span>
            Productos Más Vendidos
          </h3>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-slate-500 w-full text-center">No hay datos suficientes</p>
            ) : topProducts.map((product, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#1c6554] transition-colors" title={product.name}>
                    {product.name}
                  </p>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                    {product.sold} uds
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1c6554] to-[#0C447C] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(((product.sold / Math.max(product.sold + product.stock, 1)) * 100) || 0, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-[#1c6554] rounded-full animate-pulse"></span>
            Pedidos Recientes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  ID Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {order.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {order.customer?.name || 'Cliente'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                    {formatPrice(Number(order.total))}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status.toLowerCase()} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(order.createdAt).toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => alert(`Ver detalles del pedido ${order.id}`)}
                      className="text-sm font-medium text-[#1c6554] dark:text-green-400 hover:text-[#1c6554]/80 dark:hover:text-green-300 transition-colors"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
/**
 * Tarjeta de estadística con icono y tendencia
 */
interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ title, value, subtitle, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{subtitle}</p>
        </div>
        <div className="w-14 h-14 bg-gradient-to-br from-[#1c6554] to-[#0C447C] rounded-xl flex items-center justify-center text-white shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            trendUp ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-500">vs mes anterior</span>
        </div>
      )}
    </div>
  );
}

/**
 * Badge de estado del pedido
 */
function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    paid: 'bg-blue-100 text-blue-800 border-blue-200',
    preparing: 'bg-purple-100 text-purple-800 border-purple-200',
    dispatched: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  const labels = {
    pending: 'Pendiente',
    paid: 'Pagado',
    preparing: 'Preparando',
    dispatched: 'En camino',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
        styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-800 border-slate-200'
      }`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);
}
function MoneyIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function ActiveIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}
