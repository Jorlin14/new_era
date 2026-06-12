/**
 * API Customer Client Module - New Era Supermercado
 * 
 * Este módulo maneja todas las peticiones de clientes al backend.
 * Incluye funciones para gestión de órdenes, direcciones y perfil.
 * 
 * ⚠️ IMPORTANTE: Todas estas funciones requieren autenticación con rol CUSTOMER
 * 
 * @module lib/api-customer
 */

import { API_BASE_URL } from '@/lib/constants';

/**
 * Obtiene el token JWT almacenado en localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Buscar el token en la clave auth_token que usa el sistema
  return localStorage.getItem('auth_token');
}

/**
 * Crea headers con autenticación para peticiones al backend
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}
// ÓRDENES - CUSTOMER
/**
 * Obtiene las órdenes del cliente autenticado
 * 
 * **Endpoint:** GET /api/orders/my-orders
 * **Permisos:** CUSTOMER
 * 
 * @param {Object} [filters] - Filtros opcionales
 * @param {string} [filters.status] - Filtrar por estado
 * @param {number} [filters.page] - Página (default: 1)
 * @param {number} [filters.limit] - Resultados por página (default: 20)
 * @returns {Promise<{ data: any[]; meta: any }>} Lista de órdenes con metadata
 */
export async function getMyOrders(filters?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: any[]; meta: any }> {
  const params = new URLSearchParams();
  
  if (filters?.status) params.set('status', filters.status);
  if (filters?.page) params.set('page', filters.page.toString());
  if (filters?.limit) params.set('limit', filters.limit.toString());

  const res = await fetch(`${API_BASE_URL}/orders/my-orders?${params}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener órdenes');
  }

  const response = await res.json();
  return { data: response.data, meta: response.meta };
}

/**
 * Crea una nueva orden
 * 
 * **Endpoint:** POST /api/orders
 * **Permisos:** CUSTOMER
 * 
 * @param {Object} data - Datos de la orden
 * @param {Array} data.items - Items de la orden [{productId, quantity, unitPrice}]
 * @param {string} data.addressId - ID de la dirección de entrega
 * @param {number} data.distance - Distancia en kilómetros para calcular envío
 * @param {string} [data.notes] - Notas adicionales
 * @returns {Promise<any>} Orden creada
 */
export async function createOrder(data: {
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  addressId: string;
  distance: number;
  notes?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear orden');
  }

  const response = await res.json();
  return response.data;
}

/**
 * Obtiene la firma de Wompi para una orden
 * 
 * **Endpoint:** GET /api/orders/:id/wompi-signature
 * **Permisos:** CUSTOMER
 * 
 * @param {string} orderId - ID de la orden
 * @returns {Promise<any>} Datos de firma ({signature, amountInCents, reference, publicKey})
 */
export async function getWompiSignature(orderId: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/wompi-signature`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener firma de pago');
  }

  const response = await res.json();
  return response.data;
}
// DIRECCIONES - CUSTOMER
/**
 * Obtiene las direcciones del cliente autenticado
 * 
 * **Endpoint:** GET /api/addresses
 * **Permisos:** CUSTOMER
 * 
 * @returns {Promise<any[]>} Lista de direcciones
 */
export async function getMyAddresses(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/addresses`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener direcciones');
  }

  const response = await res.json();
  return response.data;
}

/**
 * Crea una nueva dirección
 * 
 * **Endpoint:** POST /api/addresses
 * **Permisos:** CUSTOMER
 * 
 * @param {Object} data - Datos de la dirección
 * @param {string} data.address - Dirección completa (ej: Calle 14 # 2-30)
 * @param {string} data.neighborhood - Barrio
 * @param {string} [data.details] - Indicaciones adicionales
 * @param {string} [data.label] - Etiqueta (Casa, Oficina, etc.)
 * @param {boolean} [data.isDefault] - Si es dirección por defecto
 * @returns {Promise<any>} Dirección creada
 */
export async function createAddress(data: {
  address: string;
  neighborhood: string;
  details?: string;
  label?: string;
  isDefault?: boolean;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/addresses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear dirección');
  }

  const response = await res.json();
  return response.data;
}

/**
 * Actualiza una dirección existente
 * 
 * **Endpoint:** PATCH /api/addresses/:id
 * **Permisos:** CUSTOMER
 * 
 * @param {string} id - ID de la dirección
 * @param {Object} data - Datos a actualizar (parcial)
 * @returns {Promise<any>} Dirección actualizada
 */
export async function updateAddress(
  id: string,
  data: Partial<{
    address: string;
    neighborhood: string;
    details: string;
    label: string;
    isDefault: boolean;
  }>
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/addresses/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar dirección');
  }

  const response = await res.json();
  return response.data;
}

/**
 * Establece una dirección como predeterminada
 * 
 * **Endpoint:** PATCH /api/addresses/:id/default
 * **Permisos:** CUSTOMER
 * 
 * @param {string} id - ID de la dirección
 * @returns {Promise<any>} Dirección actualizada
 */
export async function setDefaultAddress(id: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/addresses/${id}/default`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al establecer dirección por defecto');
  }

  const response = await res.json();
  return response.data;
}

/**
 * Elimina una dirección
 * 
 * **Endpoint:** DELETE /api/addresses/:id
 * **Permisos:** CUSTOMER
 * 
 * @param {string} id - ID de la dirección
 * @returns {Promise<{ message: string }>} Mensaje de confirmación
 */
export async function deleteAddress(id: string): Promise<{ message: string }> {
  const token = getAuthToken();
  console.log('[deleteAddress] Enviando DELETE para ID:', id, 'Token presente:', !!token);
  
  const res = await fetch(`${API_BASE_URL}/addresses/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  console.log('[deleteAddress] Respuesta status:', res.status, res.statusText);

  if (!res.ok) {
    const error = await res.json();
    console.error('[deleteAddress] Error del servidor:', error);
    throw new Error(error.message || 'Error al eliminar dirección');
  }

  const data = await res.json();
  console.log('[deleteAddress] Éxito:', data);
  return data;
}
