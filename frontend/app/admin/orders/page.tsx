/**
 * Admin Orders Page - New Era Supermercado
 * 
 * Página de gestión de pedidos para administradores.
 * 
 * @module app/admin/orders/page
 */

'use client';

import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '@/lib/api-admin';

interface Order {
  id: string;
  status: string;
  total: number;
  address: string;
  createdAt: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  deliverer?: {
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await getAllOrders({
        limit: 1000,
      });
      setOrders(data);
    } catch (error: any) {
      console.error('Error al cargar pedidos:', error);
      alert(error.message || 'Error al cargar pedidos');
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
      await updateOrderStatus(orderId, newStatus);
      alert('Estado actualizado correctamente');
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      alert(error.message || 'Error al actualizar estado');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PAID: 'bg-blue-100 text-blue-800 border-blue-200',
      PREPARING: 'bg-purple-100 text-purple-800 border-purple-200',
      DISPATCHED: 'bg-orange-100 text-orange-800 border-orange-200',
      DELIVERED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  const stats = {
    pending: orders.filter((o) => o.status === 'PENDING').length,
    paid: orders.filter((o) => o.status === 'PAID').length,
    preparing: orders.filter((o) => o.status === 'PREPARING').length,
    dispatched: orders.filter((o) => o.status === 'DISPATCHED').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
  };

  const displayedOrders = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Gestión de Pedidos</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Administra y monitorea todos los pedidos del sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Pendientes" value={stats.pending} color="yellow" onClick={() => setFilter('PENDING')} />
        <StatCard title="Pagados" value={stats.paid} color="blue" onClick={() => setFilter('PAID')} />
        <StatCard title="Preparando" value={stats.preparing} color="purple" onClick={() => setFilter('PREPARING')} />
        <StatCard title="Despachados" value={stats.dispatched} color="orange" onClick={() => setFilter('DISPATCHED')} />
        <StatCard title="Entregados" value={stats.delivered} color="green" onClick={() => setFilter('DELIVERED')} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'PAID', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`cursor-pointer px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              filter === status
                ? 'bg-gradient-to-r from-[#1c6554] to-[#0C447C] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 hover:border-slate-400'
            }`}
          >
            {status === 'ALL' ? 'Todos' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1c6554]"></div>
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">No hay pedidos</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
            {filter === 'ALL'
              ? 'No hay pedidos en el sistema'
              : `No hay pedidos con estado ${getStatusLabel(filter)}`}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {displayedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{order.customer.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{order.customer.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-[#1c6554] dark:text-green-400">
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="cursor-pointer text-sm font-semibold text-[#1c6554] dark:text-green-400 hover:text-[#0C447C] dark:hover:text-green-300 transition-colors"
                      >
                        Ver detalles →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-[#1c6554] to-[#0C447C] text-white px-6 py-5 flex justify-between items-center rounded-t-2xl">
              <div>
                <h3 className="text-2xl font-bold">Detalles del Pedido</h3>
                <p className="text-sm text-white/80 mt-1">
                  ID: {selectedOrder.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="cursor-pointer text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <CloseIcon />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Info del cliente */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3">Información del Cliente</h4>
                <div className="space-y-2">
                  <p className="text-slate-700"><span className="font-semibold">Nombre:</span> {selectedOrder.customer.name}</p>
                  <p className="text-slate-700"><span className="font-semibold">Email:</span> {selectedOrder.customer.email}</p>
                  {selectedOrder.customer.phone && (
                    <p className="text-slate-700"><span className="font-semibold">Teléfono:</span> {selectedOrder.customer.phone}</p>
                  )}
                  <p className="text-slate-700"><span className="font-semibold">Dirección:</span> {selectedOrder.address}</p>
                </div>
              </div>

              {/* Estado y fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold mb-1">Estado Actual</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-green-600 font-semibold mb-1">Total</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(selectedOrder.total)}
                  </p>
                </div>
              </div>

              {/* Productos */}
              <div>
                <h4 className="font-bold text-slate-900 mb-3">Productos ({selectedOrder.items.length})</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.product.name}</p>
                        <p className="text-sm text-slate-600">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="text-lg font-bold text-[#1c6554]">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cambiar estado */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-3">Cambiar Estado</h4>
                <div className="flex flex-wrap gap-2">
                  {['PAID', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedOrder.id, status)}
                      disabled={updating || selectedOrder.status === status}
                      className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        selectedOrder.status === status
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-[#1c6554] hover:text-[#1c6554]'
                      }`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 rounded-b-2xl border-t border-slate-200">
              <button
                onClick={() => setSelectedOrder(null)}
                className="cursor-pointer w-full bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
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
  color: 'yellow' | 'blue' | 'purple' | 'orange' | 'green';
  onClick?: () => void;
}

function StatCard({ title, value, color, onClick }: StatCardProps) {
  const colors = {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    green: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <div 
      onClick={onClick}
      className={`rounded-xl p-4 border-2 ${colors[color]} hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
    >
      <p className="text-xs font-bold uppercase tracking-wide opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
