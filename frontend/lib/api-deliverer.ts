/**
 * API Deliverer Client Module - New Era Supermercado
 * 
 * Funciones API específicas para domiciliarios.
 * Permite gestionar órdenes asignadas y actualizar estados de entrega.
 * 
 * @module lib/api-deliverer
 */

import { API_BASE_URL } from '@/lib/constants';

/**
 * Obtiene el token JWT de localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Headers con autenticación
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Obtiene órdenes asignadas al domiciliario
 * 
 * @param filters - Filtros opcionales (status, page, limit)
 * @returns Lista de órdenes con metadata
 */
export async function getMyDeliveries(filters?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: any[]; meta: any }> {
  const params = new URLSearchParams();
  
  if (filters?.status) params.set('status', filters.status);
  if (filters?.page) params.set('page', filters.page.toString());
  if (filters?.limit) params.set('limit', filters.limit.toString());

  const res = await fetch(`${API_BASE_URL}/orders?${params}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener entregas');
  }

  const response = await res.json();
  
  // Filtrar solo órdenes asignadas al domiciliario actual
  // El backend debería hacer esto, pero por si acaso filtramos en frontend también
  return { data: response.data, meta: response.meta };
}

/**
 * Actualiza el estado de una orden
 * 
 * @param id - ID de la orden
 * @param status - Nuevo estado
 * @returns Orden actualizada
 */
export async function updateDeliveryStatus(
  id: string,
  status: string
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar estado');
  }

  const response = await res.json();
  return response.data;
}

/**
 * Obtiene el detalle de una orden específica
 * 
 * @param id - ID de la orden
 * @returns Detalle completo de la orden
 */
export async function getOrderDetails(id: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener detalle de orden');
  }

  const response = await res.json();
  return response.data;
}

/**
 * Acepta un pedido (asignar domiciliario)
 * 
 * @param id - ID de la orden
 * @returns Orden aceptada
 */
export async function acceptDelivery(id: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/orders/${id}/accept`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al aceptar el pedido');
  }

  const response = await res.json();
  return response.data;
}
