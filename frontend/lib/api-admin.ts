/**
 * API Admin Client Module - New Era Supermercado
 * 
 * Este módulo maneja todas las peticiones administrativas al backend.
 * Incluye funciones para gestión de productos, categorías, órdenes y usuarios.
 * 
 * ⚠️ IMPORTANTE: Todas estas funciones requieren autenticación con rol ADMIN
 * 
 * @module lib/api-admin
 */

import { API_BASE_URL } from '@/lib/constants';
import type { Category, Product } from '@/lib/types';

/**
 * Obtiene el token JWT almacenado en localStorage
 * 
 * @returns {string | null} Token JWT o null si no existe
 * @private
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Crea headers con autenticación para peticiones al backend
 * 
 * @returns {HeadersInit} Headers con Content-Type y Authorization
 * @private
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}
// CATEGORÍAS - ADMIN
/**
 * Crea una nueva categoría
 * 
 * **Endpoint:** POST /api/categories
 * **Permisos:** ADMIN
 * 
 * @param {Object} data - Datos de la categoría
 * @param {string} data.name - Nombre de la categoría
 * @returns {Promise<Category>} Categoría creada
 * @throws {Error} Si la petición falla o no hay permisos
 * 
 * @example
 * const category = await createCategory({ name: 'Bebidas' });
 */
export async function createCategory(data: { name: string }): Promise<Category> {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear categoría');
  }

  const response = await res.json();
  return response.data;
}

/**
 * Actualiza una categoría existente
 * 
 * **Endpoint:** PATCH /api/categories/:id
 * **Permisos:** ADMIN
 * 
 * @param {string} id - ID de la categoría
 * @param {Object} data - Datos a actualizar
 * @param {string} data.name - Nuevo nombre de la categoría
 * @returns {Promise<Category>} Categoría actualizada
 * @throws {Error} Si la petición falla o no hay permisos
 * 
 * @example
 * const updated = await updateCategory('cat-1', { name: 'Bebidas Frías' });
 */
export async function updateCategory(
  id: string,
  data: { name: string }
): Promise<Category> {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar categoría');
  }

  const response = await res.json();
  return response.data;
}

/**
 * Elimina una categoría
 * 
 * **Endpoint:** DELETE /api/categories/:id
 * **Permisos:** ADMIN
 * 
 * ⚠️ No se puede eliminar si tiene productos asociados
 * 
 * @param {string} id - ID de la categoría
 * @returns {Promise<{ message: string }>} Mensaje de confirmación
 * @throws {Error} Si la petición falla, tiene productos asociados, o no hay permisos
 * 
 * @example
 * await deleteCategory('cat-1');
 */
export async function deleteCategory(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al eliminar categoría');
  }

  return await res.json();
}
// PRODUCTOS - ADMIN
/**
 * Obtiene todos los productos para administración (sin filtros por defecto)
 * @returns {Promise<Product[]>} Lista completa de productos
 */
export async function getAllProductsAdmin(): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/products?limit=1000&onlyActive=false`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener productos');
  }

  const response = await res.json();
  return response.data;
}

/**
 * Crea un nuevo producto
 * 
 * **Endpoint:** POST /api/products
 * **Permisos:** ADMIN
 * 
 * @param {Object} data - Datos del producto
 * @param {string} data.name - Nombre del producto
 * @param {string} [data.description] - Descripción (opcional)
 * @param {number} data.price - Precio en COP
 * @param {number} data.stock - Cantidad en inventario
 * @param {string} data.categoryId - ID de la categoría
 * @param {string} [data.imageUrl] - URL de la imagen (opcional)
 * @param {boolean} [data.isActive] - Si está activo (default: true)
 * @returns {Promise<Product>} Producto creado
 * @throws {Error} Si la petición falla o no hay permisos
 * 
 * @example
 * const product = await createProduct({
 *   name: 'Leche Entera 1L',
 *   description: 'Leche fresca pasteurizada',
 *   price: 4500,
 *   stock: 100,
 *   categoryId: 'cat-2',
 *   isActive: true
 * });
 */
export async function createProduct(data: {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl?: string | null;
  isActive?: boolean;
}): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear producto');
  }

  const response = await res.json();
  return response.data;
}

/**
 * Actualiza un producto existente
 * 
 * **Endpoint:** PATCH /api/products/:id
 * **Permisos:** ADMIN
 * 
 * @param {string} id - ID del producto
 * @param {Object} data - Datos a actualizar (parcial)
 * @returns {Promise<Product>} Producto actualizado
 * @throws {Error} Si la petición falla o no hay permisos
 * 
 * @example
 * const updated = await updateProduct('prod-1', {
 *   price: 5000,
 *   stock: 150
 * });
 */
export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    price: number;
    stock: number;
    categoryId: string;
    imageUrl: string | null;
    isActive: boolean;
  }>
): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar producto');
  }

  const response = await res.json();
  return response.data;
}

/**
 * Elimina (desactiva) un producto
 * 
 * **Endpoint:** DELETE /api/products/:id
 * **Permisos:** ADMIN
 * 
 * ℹ️ Soft delete: marca como isActive=false en lugar de eliminar
 * 
 * @param {string} id - ID del producto
 * @returns {Promise<{ message: string; product: any }>} Confirmación y producto desactivado
 * @throws {Error} Si la petición falla o no hay permisos
 * 
 * @example
 * await deleteProduct('prod-1');
 */
export async function deleteProduct(
  id: string
): Promise<{ message: string; product: any }> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al eliminar producto');
  }

  return await res.json();
}
// AUTENTICACIÓN
/**
 * Inicia sesión en el sistema
 * 
 * **Endpoint:** POST /api/auth/login
 * 
 * Almacena el token JWT en localStorage si el login es exitoso
 * 
 * @param {Object} credentials - Credenciales de acceso
 * @param {string} credentials.email - Email del usuario
 * @param {string} credentials.password - Contraseña
 * @returns {Promise<{ token: string; user: any }>} Token y datos del usuario
 * @throws {Error} Si las credenciales son incorrectas
 * 
 * @example
 * const { token, user } = await login({
 *   email: 'admin@newera.com',
 *   password: 'securepass'
 * });
 */
export async function login(credentials: {
  email: string;
  password: string;
}): Promise<{ token: string; user: any }> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al iniciar sesión');
  }

  const response = await res.json();
  
  // Extraer data del response
  const { user, token } = response.data || response;
  
  // Guardar token en localStorage
  if (token) {
    localStorage.setItem('auth_token', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  return { user, token };
}

/**
 * Registra un nuevo usuario en el sistema
 * 
 * **Endpoint:** POST /api/auth/register
 * 
 * Almacena el token JWT en localStorage si el registro es exitoso
 * 
 * @param {Object} data - Datos del nuevo usuario
 * @param {string} data.name - Nombre completo del usuario
 * @param {string} data.email - Email del usuario (debe ser único)
 * @param {string} data.password - Contraseña (mínimo 6 caracteres)
 * @param {string} data.phone - Número de teléfono
 * @returns {Promise<{ token: string; user: any }>} Token y datos del usuario creado
 * @throws {Error} Si el email ya existe o la validación falla
 * 
 * @example
 * const { token, user } = await register({
 *   name: 'Juan Pérez',
 *   email: 'juan@example.com',
 *   password: 'securepass123',
 *   phone: '3001234567'
 * });
 */
export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
}): Promise<{ token: string; user: any }> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al registrar usuario');
  }

  const response = await res.json();
  
  // Extraer data del response
  const { user, token } = response.data || response;
  
  // Guardar token en localStorage automáticamente después del registro
  if (token) {
    localStorage.setItem('auth_token', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  return { user, token };
}

/**
 * Cierra la sesión del usuario
 * 
 * Elimina el token JWT y datos de usuario de localStorage
 * 
 * @example
 * logout();
 * window.location.href = '/auth/login';
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
}

/**
 * Obtiene el usuario actual desde localStorage
 * 
 * @returns {any | null} Datos del usuario o null si no hay sesión
 * 
 * @example
 * const user = getCurrentUser();
 * if (user?.role === 'ADMIN') {
 *   // Mostrar panel admin
 * }
 */
export function getCurrentUser(): any | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Verifica si el usuario tiene sesión activa
 * 
 * @returns {boolean} true si hay token, false si no
 * 
 * @example
 * if (!isAuthenticated()) {
 *   redirect('/auth/login');
 * }
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
// PROMOCIONES — ADMIN (CRUD)
// Para lectura pública usar lib/api.ts → getPromotions()
/**
 * Crea una nueva promoción
 * 
 * **Endpoint:** POST /api/promotions
 * **Permisos:** ADMIN
 * 
 * @param {Object} data - Datos de la promoción
 * @param {string} data.title - Título de la promoción
 * @param {string} data.description - Descripción
 * @param {string} [data.imageUrl] - URL de la imagen
 * @param {string} [data.ctaText] - Texto del botón
 * @param {string} [data.ctaLink] - Enlace del botón
 * @param {string} [data.startDate] - Fecha de inicio
 * @param {string} [data.endDate] - Fecha de fin
 * @param {number} [data.priority] - Prioridad (0-100)
 * @returns {Promise<any>} Promoción creada
 * @throws {Error} Si la petición falla o no hay permisos
 * 
 * @example
 * const promotion = await createPromotion({
 *   title: 'Productos Frescos',
 *   description: 'Ofertas del día',
 *   priority: 10
 * });
 */
export async function createPromotion(data: {
  title: string;
  description: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  startDate?: string;
  endDate?: string;
  priority?: number;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/promotions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear promoción');
  }

  const response = await res.json();
  return response.data;
}

/**
 * Actualiza una promoción existente
 * 
 * **Endpoint:** PATCH /api/promotions/:id
 * **Permisos:** ADMIN
 * 
 * @param {string} id - ID de la promoción
 * @param {Object} data - Datos a actualizar (parcial)
 * @returns {Promise<any>} Promoción actualizada
 * @throws {Error} Si la petición falla o no hay permisos
 * 
 * @example
 * const updated = await updatePromotion('promo-1', {
 *   isActive: false
 * });
 */
export async function updatePromotion(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    imageUrl: string | null;
    ctaText: string;
    ctaLink: string | null;
    isActive: boolean;
    startDate: string;
    endDate: string | null;
    priority: number;
  }>
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar promoción');
  }

  const response = await res.json();
  return response.data;
}

/**
 * Elimina una promoción
 * 
 * **Endpoint:** DELETE /api/promotions/:id
 * **Permisos:** ADMIN
 * 
 * @param {string} id - ID de la promoción
 * @returns {Promise<{ message: string }>} Mensaje de confirmación
 * @throws {Error} Si la petición falla o no hay permisos
 * 
 * @example
 * await deletePromotion('promo-1');
 */
export async function deletePromotion(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al eliminar promoción');
  }

  return await res.json();
}
// ÓRDENES - ADMIN
/**
 * Obtiene todas las órdenes (solo ADMIN/CASHIER)
 * 
 * **Endpoint:** GET /api/orders
 * **Permisos:** ADMIN, CASHIER
 * 
 * @param {Object} [filters] - Filtros opcionales
 * @param {string} [filters.status] - Filtrar por estado
 * @param {number} [filters.page] - Página (default: 1)
 * @param {number} [filters.limit] - Resultados por página (default: 20)
 * @returns {Promise<{ data: any[]; meta: any }>} Lista de órdenes con metadata
 * @throws {Error} Si la petición falla o no hay permisos
 * 
 * @example
 * const { data: orders, meta } = await getAllOrders({ status: 'PENDING' });
 */
export async function getAllOrders(filters?: {
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
    throw new Error(error.message || 'Error al obtener órdenes');
  }

  const response = await res.json();
  return { data: response.data, meta: response.meta };
}

/**
 * Actualiza el estado de una orden
 * 
 * **Endpoint:** PATCH /api/orders/:id/status
 * **Permisos:** ADMIN, CASHIER, DELIVERER (según estado)
 * 
 * @param {string} id - ID de la orden
 * @param {string} status - Nuevo estado (PENDING, PAID, PREPARING, DISPATCHED, DELIVERED, CANCELLED)
 * @returns {Promise<any>} Orden actualizada
 * @throws {Error} Si la petición falla o no hay permisos
 * 
 * @example
 * const updated = await updateOrderStatus('order-1', 'PREPARING');
 */
export async function updateOrderStatus(
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
    throw new Error(error.message || 'Error al actualizar estado de orden');
  }

  const response = await res.json();
  return response.data;
}
// UPLOAD - ADMIN
/**
 * Sube una imagen de producto al servidor
 * 
 * **Endpoint:** POST /api/upload/product-image
 * **Permisos:** ADMIN
 * 
 * @param {File} file - Archivo de imagen (JPG, PNG, GIF, WEBP)
 * @param {Function} [onProgress] - Callback opcional para progreso de subida
 * @returns {Promise<{ imageUrl: string; filename: string }>} URL de la imagen subida
 * @throws {Error} Si la petición falla o el archivo no es válido
 * 
 * @example
 * const file = document.querySelector('input[type="file"]').files[0];
 * const { imageUrl } = await uploadProductImage(file, (progress) => {
 *   console.log(`Subiendo: ${progress}%`);
 * });
 */
export async function uploadProductImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ imageUrl: string; filename: string }> {
  const formData = new FormData();
  formData.append('image', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });
    }
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.data);
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || 'Error al subir imagen'));
        } catch {
          reject(new Error('Error al subir imagen'));
        }
      }
    });
    xhr.addEventListener('error', () => {
      reject(new Error('Error de red al subir imagen'));
    });

    // Configurar y enviar petición
    xhr.open('POST', `${API_BASE_URL}/upload/product-image`);
    const token = getAuthToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send(formData);
  });
}
// DIRECCIONES - CLIENTE
/**
 * Obtiene las direcciones del cliente actual
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
    // Si da error de permisos, probablemente no sea customer o no esté logueado
    return [];
  }

  const response = await res.json();
  return response.data || [];
}

/**
 * Cambia la contraseña del usuario actual
 * 
 * **Endpoint:** PATCH /api/auth/me/password
 * 
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<{ message: string }>} Mensaje de éxito
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/me/password`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar la contraseña');
  }

  return await res.json();
}

/**
 * Actualiza el perfil del usuario actual (nombre y teléfono)
 * 
 * **Endpoint:** PATCH /api/auth/me
 * 
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<any>} Mensaje de éxito y usuario
 */
export async function updateProfile(data: { name: string; phone?: string }): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar el perfil');
  }

  return await res.json();
}
/**
 * Obtiene las estadísticas generales para el dashboard (solo ADMIN)
 * 
 * @returns {Promise<any>} Estadísticas del dashboard
 */
export async function getDashboardStats(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/stats/dashboard`, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener estadísticas');
  }
  
  const response = await res.json();
  return response;
}
export async function getAllUsersAdmin(query?: { role?: string; search?: string; page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (query?.role) params.append('role', query.role);
  if (query?.search) params.append('search', query.search);
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());

  const res = await fetch(`${API_BASE_URL}/users?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener usuarios');
  }
  return res.json();
}

export async function updateUserAdmin(id: string, data: { name?: string; phone?: string; role?: string; isActive?: boolean }) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar usuario');
  }
  return res.json();
}

export async function deleteUserAdmin(id: string) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al eliminar usuario');
  }
  return res.json();
}
