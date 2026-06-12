/**
 * Deliverer History Page - New Era Supermercado
 * 
 * Página de historial de entregas completadas.
 * 
 * @module app/deliverer/history/page
 */

'use client';

import { useState, useEffect } from 'react';
import { getMyDeliveries } from '@/lib/api-deliverer';
import { getCurrentUser } from '@/lib/api-admin';

interface Order {
  id: string;
  status: string;
  total: number;
  address: string;
  createdAt: string;
  deliveredAt?: string;
  customer: {
    name: string;
  };
}

export default function DelivererHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [page, user]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, meta } = await getMyDeliveries({
        status: 'DELIVERED',
        page,
        limit: 10,
      });

      // El backend ya filtra las órdenes correctamente
      setOrders(data);
      setTotalPages(meta?.totalPages || 1);
    } catch (error: any) {
      console.error('Error al cargar historial:', error);
      alert(error.message || 'Error al cargar historial');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calcular total de entregas y ganancias (ejemplo)
  const totalDelivered = orders.length;
  const totalEarnings = orders.reduce((sum, order) => sum + Number(order.total), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Historial de Entregas</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Revisa todas tus entregas completadas
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <CheckCircleIcon />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wide">Entregas Completadas</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalDelivered}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <MoneyIcon />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wide">Valor Total Entregado</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(totalEarnings)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1c6554] dark:border-green-400"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center shadow-sm">
          <HistoryIcon className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
            No hay entregas en el historial
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Tus entregas completadas aparecerán aquí
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Fecha Entrega
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {order.customer.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                        {order.address}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {order.deliveredAt
                          ? formatDate(order.deliveredAt)
                          : formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-lg font-bold text-[#1c6554] dark:text-green-400">
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-5 py-2.5 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-5 py-2.5 text-slate-700 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-5 py-2.5 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
function CheckCircleIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function HistoryIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
