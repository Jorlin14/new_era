/**
 * Product Card Component - New Era Supermercado
 * 
 * Tarjeta de producto con diseño premium de e-commerce:
 * - Imagen del producto con aspect ratio consistente
 * - Badge de categoría (esquina superior izquierda)
 * - Badge de descuento/stock bajo (esquina superior derecha)
 * - Nombre del producto con clamp a 2 líneas
 * - Precio prominente con unidad
 * - Botón circular verde "+" para agregar al carrito
 * - Controles de cantidad cuando el producto está en el carrito
 * - Diseño con bordes redondeados y sombras sutiles
 * 
 * @module components/ProductCard
 */

'use client';

import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/lib/types';
import './ProductCard.css';

/**
 * Props del componente ProductCard.
 */
interface ProductCardProps {
  /** Producto a mostrar */
  product: Product;
}

/**
 * Tarjeta de producto para el grid del catálogo.
 * 
 * Diseño premium con imagen, categoría, nombre, precio y botón de agregar.
 * Si el producto ya está en el carrito, muestra controles de cantidad.
 * 
 * @param {ProductCardProps} props
 * @returns {JSX.Element}
 */
export default function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((item) => item.product.id === product.id);
  const isInCart = Boolean(cartItem);
  const isOutOfStock = product.stock <= 0;

  return (
    <article className="product-card">
      {/* ====== ZONA DE IMAGEN ====== */}
      <div className="product-image-area">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'product-image-fallback';
                fallback.innerHTML = '<svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>';
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="product-image-fallback">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {/* Overlay agotado */}
        {isOutOfStock && (
          <div className="product-out-of-stock-overlay">
            <span className="product-out-of-stock-badge">Agotado</span>
          </div>
        )}

        {/* Badge categoría (top-left) */}
        {product.category && !isOutOfStock && (
          <div className="product-category-badge">
            {product.category.name}
          </div>
        )}

        {/* Badge stock bajo (top-right) */}
        {product.stock > 0 && product.stock <= 10 && (
          <div className="product-stock-badge">
            ¡Solo {product.stock}!
          </div>
        )}
      </div>

      {/* ====== INFORMACIÓN DEL PRODUCTO ====== */}
      <div className="product-info">
        {/* Categoría texto pequeño */}
        {product.category && (
          <span className="product-category-text">{product.category.name}</span>
        )}

        {/* Nombre del producto */}
        <h3 className="product-name">{product.name}</h3>

        {/* Precio y botón de agregar */}
        <div className="product-price-row">
          <div className="product-price-block">
            <span className="product-price">{formatPrice(product.price)}</span>
            {product.stock > 10 && (
              <span className="product-unit">/kg</span>
            )}
          </div>

          {/* Botón de acción */}
          {isOutOfStock ? (
            <div className="product-add-btn product-add-btn-disabled" aria-disabled="true">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ) : isInCart && cartItem ? (
            <div className="product-quantity-controls">
              <button
                type="button"
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="product-qty-btn product-qty-btn-minus"
                aria-label="Disminuir cantidad"
              >
                −
              </button>
              <span className="product-qty-value">{cartItem.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                disabled={cartItem.quantity >= product.stock}
                className="product-qty-btn product-qty-btn-plus"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addItem(product)}
              className="product-add-btn"
              aria-label={`Agregar ${product.name} al carrito`}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
