/**
 * Cashier Orders Page - New Era Supermercado
 * 
 * Página de gestión de órdenes para cajeros.
 * 
 * @module app/cashier/orders/page
 */

'use client';

import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '@/lib/api-admin';
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
    email: string;
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

export default function CashierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ orderId: string; newStatus: string } | null>(null);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await getAllOrders({
        status: filter === 'ALL' ? undefined : filter,
      });
      setOrders(data);
    } catch (error: any) {
      console.error('Error al cargar órdenes:', error);
      setToastMessage({ text: error.message || 'Error al cargar órdenes', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setPendingStatusChange({ orderId, newStatus });
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    const { orderId, newStatus } = pendingStatusChange;
    setPendingStatusChange(null);

    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, newStatus);
      setToastMessage({ text: 'Estado actualizado correctamente', type: 'success' });
      loadOrders();
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      setToastMessage({ text: error.message || 'Error al actualizar estado', type: 'error' });
    } finally {
      setUpdatingId(null);
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

  const getAvailableActions = (status: string): { label: string; value: string }[] => {
    const actions: Record<string, { label: string; value: string }[]> = {
      PENDING: [{ label: 'Marcar como Pagado', value: 'PAID' }],
      PAID: [{ label: 'Iniciar Preparación', value: 'PREPARING' }],
      PREPARING: [], // El domiciliario debe despacharlo
      DISPATCHED: [
        { label: 'Entrega Exitosa', value: 'DELIVERED' },
        { label: 'Entrega Fallida', value: 'CANCELLED' }
      ],
      DELIVERED: [],
      CANCELLED: [],
    };
    return actions[status] || [];
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
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Gestión de Órdenes</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Procesa pagos y actualiza estados de pedidos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wide">Pendientes de Pago</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <PendingIcon />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium uppercase tracking-wide">Pagadas</p>
              <p className="text-3xl font-bold text-slate-900 mt-3">{stats.paid}</p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <CheckIcon />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium uppercase tracking-wide">En Preparación</p>
              <p className="text-3xl font-bold text-slate-900 mt-3">{stats.preparing}</p>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <BoxIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING', 'PAID', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              filter === status
                ? 'bg-gradient-to-r from-[#1c6554] to-[#0C447C] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 hover:border-slate-400'
            }`}
          >
            {status === 'ALL' ? 'Todas' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1c6554]"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">No hay órdenes</p>
          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
            {filter === 'ALL'
              ? 'No hay órdenes en el sistema'
              : `No hay órdenes con estado ${getStatusLabel(filter)}`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
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
              <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-900 dark:text-white mb-1">{order.customer.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{order.customer.email}</p>
                {order.customer.phone && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">📞 {order.customer.phone}</p>
                )}
              </div>

              {/* Actions */}
              {getAvailableActions(order.status).length > 0 && (
                <div className="flex gap-2">
                  {getAvailableActions(order.status).map((action) => (
                    <button
                      key={action.value}
                      onClick={() => handleStatusChange(order.id, action.value)}
                      disabled={updatingId === order.id}
                      className="flex-1 bg-gradient-to-r from-[#1c6554] to-[#0C447C] text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {action.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-[#1c6554] hover:text-[#1c6554] hover:bg-slate-50 transition-all duration-300"
                  >
                    Ver Detalles
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-[#1c6554] to-[#0C447C] text-white px-6 py-5 rounded-t-2xl flex justify-between items-start">
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
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-600 font-semibold mb-1">ID</p>
                <p className="font-mono text-slate-900">{selectedOrder.id}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-600 font-semibold mb-1">Cliente</p>
                <p className="text-slate-900">{selectedOrder.customer.name}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="text-sm text-slate-600 font-semibold mb-1">Dirección</p>
                <p className="text-slate-900">{selectedOrder.address}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-semibold mb-3">Productos</p>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-3 px-4 border-b border-slate-200 bg-slate-50 rounded-lg mb-2">
                    <span className="text-slate-900">{item.quantity}x {item.product.name}</span>
                    <span className="font-semibold text-[#1c6554]">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <p className="text-sm text-green-600 font-semibold mb-1">Total</p>
                <p className="text-3xl font-bold text-green-700">
                  {formatCurrency(selectedOrder.total)}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 rounded-b-2xl border-t border-slate-200">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {pendingStatusChange && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full shadow-2xl animate-scale-in overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <BoxIcon />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Confirmar Acción
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                ¿Cambiar estado a <span className="font-bold text-slate-900 dark:text-white">{getStatusLabel(pendingStatusChange.newStatus)}</span>?
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex gap-3">
              <button
                onClick={() => setPendingStatusChange(null)}
                className="flex-1 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmStatusChange}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#1c6554] to-[#0C447C] dark:from-green-600 dark:to-blue-600 text-white font-semibold hover:shadow-lg rounded-xl transition-all"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function PendingIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
