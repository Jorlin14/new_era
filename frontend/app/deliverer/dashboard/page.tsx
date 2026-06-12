/**
 * Deliverer Dashboard Page - New Era Supermercado
 * 
 * Dashboard principal para domiciliarios.
 * Muestra órdenes asignadas y permite actualizar su estado.
 * 
 * @module app/deliverer/dashboard/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMyDeliveries, updateDeliveryStatus, acceptDelivery } from '@/lib/api-deliverer';
import { getCurrentUser } from '@/lib/api-admin';
import Toast from '@/components/Toast';

interface Order {
  id: string;
  status: string;
  total: number;
  address: string;
  createdAt: string;
  customer: {
    name: string;
    phone?: string;
  };
  deliverer?: {
    id: string;
    name: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    product: {
      name: string;
    };
  }>;
}

export default function DelivererDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [user, setUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await getMyDeliveries({
        status: filter === 'ALL' ? undefined : filter,
      });
      
      // El backend ya filtra las órdenes correctamente
      setOrders(data);
    } catch (error: any) {
      console.error('Error al cargar entregas:', error);
      setToastMessage({ text: error.message || 'Error al cargar entregas', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!confirm(`¿Cambiar estado a ${getStatusLabel(newStatus)}?`)) {
      return;
    }

    try {
      setUpdating(true);
      await updateDeliveryStatus(orderId, newStatus);
      setToastMessage({ text: 'Estado actualizado correctamente', type: 'success' });
      loadOrders(); // Recargar órdenes
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      setToastMessage({ text: error.message || 'Error al actualizar estado', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!confirm('¿Estás seguro de que deseas aceptar este pedido?')) {
      return;
    }

    try {
      setUpdating(true);
      await acceptDelivery(orderId);
      setToastMessage({ text: '¡Pedido aceptado exitosamente!', type: 'success' });
      loadOrders();
    } catch (error: any) {
      console.error('Error al aceptar pedido:', error);
      setToastMessage({ text: error.message || 'Error al aceptar pedido', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      PAID: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      PREPARING: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      DISPATCHED: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      DELIVERED: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800',
      CANCELLED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800',
    };

    return styles[status] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      PREPARING: 'Preparando',
      DISPATCHED: 'Despachado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
    };

    return labels[status] || status;
  };

  const getNextStatus = (currentStatus: string): string | null => {
    if (currentStatus === 'PREPARING') return 'DISPATCHED';
    return null;
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Estadísticas rápidas
  const stats = {
    dispatched: orders.filter((o) => o.status === 'DISPATCHED').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
    total: orders.length,
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Mis Entregas</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Gestiona tus entregas asignadas y actualiza su estado
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Pendientes"
          value={stats.dispatched}
          icon={<TruckIcon />}
          color="orange"
        />
        <StatCard
          title="Entregadas"
          value={stats.delivered}
          icon={<CheckIcon />}
          color="green"
        />
        <StatCard
          title="Total Hoy"
          value={stats.total}
          icon={<BoxIcon />}
          color="blue"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'DISPATCHED', 'DELIVERED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              filter === status
                ? 'bg-gradient-to-r from-[#1c6554] to-[#0C447C] dark:from-green-600 dark:to-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            {status === 'ALL' ? 'Todas' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1c6554] dark:border-green-400"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center shadow-sm">
          <TruckIcon className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">No hay entregas</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {filter === 'ALL'
              ? 'No tienes entregas asignadas en este momento'
              : `No hay entregas con estado ${getStatusLabel(filter)}`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Orden #{order.id.substring(0, 8).toUpperCase()}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#1c6554] dark:text-green-400">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 rounded-lg border-l-4 border-[#1c6554] dark:border-green-400 shadow-sm">
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-[#1c6554] dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{order.customer.name}</p>
                    {order.customer.phone && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">📞 {order.customer.phone}</p>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      📍 {order.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-4 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Productos ({order.items.length}):
                </p>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700"
                    >
                      <span>
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="font-semibold text-[#1c6554] dark:text-green-400">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {!order.deliverer ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    disabled={updating}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Procesando...' : 'Aceptar Pedido'}
                  </button>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                  >
                    Ver Detalles
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  {getNextStatus(order.status) && (
                    <button
                      onClick={() =>
                        handleStatusChange(order.id, getNextStatus(order.status)!)
                      }
                      disabled={updating}
                      className="flex-1 bg-gradient-to-r from-[#1c6554] to-[#0C447C] dark:from-green-600 dark:to-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? 'Actualizando...' : 'Marcar como Despachado'}
                    </button>
                  )}
                  {/* Botón de rastreo GPS SIEMPRE disponible para pedidos aceptados */}
                  <Link
                    href={`/deliverer/dashboard/tracking?orderId=${order.id}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    <GpsIcon />
                    Rastrear GPS
                  </Link>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:border-[#1c6554] dark:hover:border-green-400 hover:text-[#1c6554] dark:hover:text-green-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                  >
                    Ver Detalles
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles (simple) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-[#1c6554] to-[#0C447C] dark:from-green-600 dark:to-blue-600 text-white px-6 py-5 rounded-t-2xl flex justify-between items-start">
              <h3 className="text-2xl font-bold">
                Detalles de Orden
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <CloseIcon />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mb-1">ID de Orden</p>
                <p className="font-mono text-lg text-slate-900 dark:text-white">{selectedOrder.id}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mb-1">Cliente</p>
                <p className="text-lg text-slate-900 dark:text-white">{selectedOrder.customer.name}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">Dirección de Entrega</p>
                <p className="text-lg text-blue-900 dark:text-blue-300">{selectedOrder.address}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border-2 border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400 font-semibold mb-1">Total</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(selectedOrder.total)}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-b-2xl border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-slate-900 dark:bg-slate-700 text-white px-4 py-3 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'orange' | 'green' | 'blue';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colors = {
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 ${colors[color]} rounded-xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>{icon}</div>
      </div>
    </div>
  );
}
function TruckIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function UserIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function GpsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
