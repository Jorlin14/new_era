/**
 * @fileoverview Constantes globales de la aplicación
 * Contiene configuraciones, umbrales, colores corporativos y claves de almacenamiento
 */

/** Colores corporativos de New Era Supermercado */
export const BRAND = {
  /** Color verde principal #1c6554 (RGB: 28, 107, 84) */
  green: '#1c6554',
} as const;

/** Umbral de envío gratis en COP */
export const FREE_SHIPPING_THRESHOLD = 50_000;

/** Costo de envío estándar en COP */
export const STANDARD_SHIPPING_COST = 5_000;

/** Clave de persistencia del carrito en localStorage */
export const CART_STORAGE_KEY = 'new-era-cart';

/** URL base de la API (configurable vía variable de entorno) */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

/** URL base del backend (sin /api) para archivos estáticos */
export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

/**
 * Convierte una URL de imagen relativa o absoluta a una URL absoluta del backend
 * 
 * @param imageUrl - URL de la imagen (puede ser relativa o absoluta)
 * @returns URL absoluta lista para usar
 * 
 * @example
 * getImageUrl('/uploads/products/image.jpg') 
 * // => 'http://localhost:4000/uploads/products/image.jpg'
 * 
 * getImageUrl('http://localhost:4000/uploads/products/image.jpg')
 * // => 'http://localhost:4000/uploads/products/image.jpg'
 */
export function getImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  
  // Si ya es una URL absoluta o base64, devolverla tal cual
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Si es relativa, construir URL absoluta
  return `${BACKEND_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}
