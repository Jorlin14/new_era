/**
 * Format Utilities Module - New Era Supermercado
 * 
 * Funciones utilitarias para formateo de precios y cálculos de costos.
 * 
 * @module lib/format
 */

import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from '@/lib/constants';

/**
 * Formatea un número como precio en pesos colombianos (COP).
 * 
 * - Usa el formato de moneda de Colombia (es-CO)
 * - Sin decimales (COP no usa centavos)
 * - Incluye símbolo de moneda y separadores de miles
 * 
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado (ej: "$25.000")
 * 
 * @example
 * formatPrice(25000); // "$25.000"
 * formatPrice(1500);  // "$1.500"
 * formatPrice(0);     // "$0"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Calcula el costo de envío según el subtotal del carrito.
 * 
 * - Envío gratis si el subtotal >= $50.000
 * - Costo estándar de $5.000 en caso contrario
 * 
 * @param {number} subtotal - Subtotal del carrito
 * @returns {number} Costo de envío (0 o STANDARD_SHIPPING_COST)
 * 
 * @example
 * getShippingCost(60000); // 0 (envío gratis)
 * getShippingCost(30000); // 5000 (costo estándar)
 */
export function getShippingCost(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
}

/**
 * Calcula el total del pedido (subtotal + costo de envío).
 * 
 * @param {number} subtotal - Subtotal del carrito
 * @returns {number} Total del pedido incluyendo envío
 * 
 * @example
 * getOrderTotal(60000); // 60000 (envío gratis)
 * getOrderTotal(30000); // 35000 (30000 + 5000 de envío)
 */
export function getOrderTotal(subtotal: number): number {
  return subtotal + getShippingCost(subtotal);
}
