/**
 * Cliente API público — New Era Supermercado
 *
 * Peticiones al backend que NO requieren autenticación:
 * categorías, productos y promociones de la tienda.
 *
 * @module lib/api
 */

import { API_BASE_URL } from '@/lib/constants';
import type { Category, Product, Promotion } from '@/lib/types';

// Re-exportar utilidades de formateo usadas en la tienda
export { formatPrice, getShippingCost, getOrderTotal } from '@/lib/format';

/** URL base del API (ej: http://localhost:4000/api) */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

// ─────────────────────────────────────────────
// CATEGORÍAS
// ─────────────────────────────────────────────

/** GET /api/categories — Lista todas las categorías */
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${getApiBaseUrl()}/categories?limit=50`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error('Error al obtener categorías');
  }

  const response = await res.json();
  return response.data;
}

// ─────────────────────────────────────────────
// PRODUCTOS
// ─────────────────────────────────────────────

/**
 * GET /api/products — Lista productos activos con filtros opcionales.
 *
 * @param search - Búsqueda por nombre/descripción
 * @param categoryId - Filtrar por categoría
 * @param page - Número de página para paginación
 * @param limit - Cantidad de productos por página
 */
export async function getProducts(
  search?: string,
  categoryId?: string,
  page?: number,
  limit?: number
): Promise<Product[]> {
  const params = new URLSearchParams();
  params.set('onlyActive', 'true');

  if (search?.trim()) {
    params.set('search', search.trim());
  }
  if (categoryId) {
    params.set('categoryId', categoryId);
  }
  if (page) {
    params.set('page', page.toString());
  }
  if (limit) {
    params.set('limit', limit.toString());
  }

  const res = await fetch(`${getApiBaseUrl()}/products?${params}`, {
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error('Error al obtener productos');
  }

  const response = await res.json();
  return response.data;
}

// ─────────────────────────────────────────────
// PROMOCIONES (públicas)
// ─────────────────────────────────────────────

/** GET /api/promotions — Lista promociones con filtros opcionales */
export async function getPromotions(filters?: {
  onlyActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ data: Promotion[]; meta: Record<string, unknown> }> {
  const params = new URLSearchParams();

  if (filters?.onlyActive) params.set('onlyActive', 'true');
  if (filters?.page) params.set('page', filters.page.toString());
  if (filters?.limit) params.set('limit', filters.limit.toString());

  const res = await fetch(`${getApiBaseUrl()}/promotions?${params}`);

  if (!res.ok) {
    throw new Error('Error al obtener promociones');
  }

  const response = await res.json();
  return { data: response.data, meta: response.meta };
}

/** GET /api/promotions/active/popup — Promoción activa de mayor prioridad */
export async function getActivePromotion(): Promise<Promotion | null> {
  const res = await fetch(`${getApiBaseUrl()}/promotions/active/popup`);

  if (!res.ok) {
    throw new Error('Error al obtener promoción activa');
  }

  const response = await res.json();
  return response.data;
}
