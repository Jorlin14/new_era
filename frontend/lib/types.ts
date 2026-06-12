/**
 * Type Definitions Module - New Era Supermercado
 * 
 * Definiciones de tipos TypeScript para todo el proyecto.
 * Estos tipos están alineados con el modelo Prisma del backend.
 * 
 * @module lib/types
 */

/**
 * Categoría de productos.
 * 
 * Representa una categoría del catálogo (ej: Frutas y Verduras, Lácteos).
 */
export interface Category {
  /** ID único de la categoría */
  id: string;
  /** Nombre de la categoría */
  name: string;
  /** Fecha de creación (ISO 8601) */
  createdAt?: string;
  /** Conteo de relaciones (Agregado por Prisma) */
  _count?: {
    products: number;
  };
}

/**
 * Producto del catálogo.
 * 
 * Representa un producto disponible para venta.
 */
export interface Product {
  /** ID único del producto */
  id: string;
  /** Nombre del producto */
  name: string;
  /** Descripción detallada (opcional) */
  description: string | null;
  /** Precio en pesos colombianos (COP) */
  price: number;
  /** Cantidad disponible en inventario */
  stock: number;
  /** URL de la imagen del producto (opcional) */
  imageUrl: string | null;
  /** Indica si el producto está activo/visible */
  isActive: boolean;
  /** ID de la categoría a la que pertenece */
  categoryId: string;
  /** Objeto categoría relacionado (opcional) */
  category?: Category;
  /** Fecha de creación (ISO 8601) */
  createdAt?: string;
  /** Fecha de última actualización (ISO 8601) */
  updatedAt?: string;
}

/**
 * Item en el carrito de compras.
 * 
 * Representa un producto agregado al carrito con su cantidad.
 */
export interface CartItem {
  /** Producto agregado */
  product: Product;
  /** Cantidad de unidades */
  quantity: number;
}

/**
 * Promoción del sistema (popup y banners).
 * Alineado con el modelo Prisma Promotion.
 */
export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  ctaText: string;
  ctaLink?: string | null;
  isActive?: boolean;
  startDate?: string;
  endDate?: string | null;
  priority: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Contexto del carrito de compras.
 * 
 * Define la interfaz del CartContext que maneja el estado del carrito.
 * Incluye items, métodos de manipulación, y estado del drawer.
 */
export interface CartContextType {
  /** Lista de items en el carrito */
  items: CartItem[];
  /** Agregar un producto al carrito (incrementa cantidad si ya existe) */
  addItem: (product: Product) => void;
  /** Remover completamente un producto del carrito */
  removeItem: (productId: string) => void;
  /** Actualizar cantidad de un producto (elimina si quantity <= 0) */
  updateQuantity: (productId: string, quantity: number) => void;
  /** Vaciar el carrito completamente */
  clearCart: () => void;
  /** Total de unidades en el carrito */
  totalItems: number;
  /** Precio total (subtotal) sin incluir envío */
  totalPrice: number;
  /** Estado de visibilidad del drawer del carrito */
  isOpen: boolean;
  /** Controlar visibilidad del drawer */
  setIsOpen: (open: boolean) => void;
}
