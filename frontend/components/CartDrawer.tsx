/**
 * Cart Drawer Component - New Era Supermercado
 * 
 * Drawer lateral del carrito de compras con:
 * - Lista de items en el carrito
 * - Controles de cantidad
 * - Cálculo de subtotal, envío y total
 * - Indicador de envío gratis
 * - Botones de checkout y vaciar carrito
 * 
 * @module components/CartDrawer
 */

'use client';

import Link from 'next/link';
import React, { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import CategoryIcon from '@/components/CategoryIcon';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { formatPrice, getOrderTotal, getShippingCost } from '@/lib/format';

/**
 * Componente de drawer lateral del carrito.
 * 
 * Se abre/cierra desde el Header al hacer clic en el botón del carrito.
 * 
 * @returns {JSX.Element}
 */
export default function CartDrawer() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, isOpen, setIsOpen } =
    useCart();

  const shippingCost = getShippingCost(totalPrice);
  const orderTotal = getOrderTotal(totalPrice);

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Carrito de compras"
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1c6554]/10 dark:bg-[#1c6554]/20 flex items-center justify-center shadow-sm">
              <CartIcon />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mi Carrito</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all duration-200 hover:scale-110"
            aria-label="Cerrar carrito"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <ul className="space-y-4">
              {items.map((item, index) => (
                <li
                  key={item.product.id}
                  className="flex gap-4 p-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-[#1c6554]/30 dark:hover:border-[#1c6554]/30 transition-all duration-200 shadow-sm hover:shadow-md animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <CategoryIcon name={item.product.category?.name || 'Todos los productos'} className="w-12 h-12" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {item.product.name}
                    </h3>
                    <p className="text-sm font-bold text-[#1c6554] dark:text-green-400 mt-1">
                      {formatPrice(item.product.price)}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold text-slate-900 dark:text-white w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id)}
                        className="ml-auto w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-slate-200 dark:border-slate-800 px-6 py-6 space-y-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 shadow-2xl">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 shadow-sm">
              <CheckIcon />
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                {shippingCost === 0
                  ? '🎉 ¡Envío gratis incluido!'
                  : `Agrega ${formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)} para envío gratis`}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Envío</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900 dark:text-white">Total</span>
                <span className="text-xl font-bold text-[#1c6554] dark:text-green-400">
                  {formatPrice(orderTotal)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full py-4 bg-[#1c6554] hover:bg-[#1c6554]/90 text-white font-bold text-center transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl text-base"
            >
              Proceder al pago
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="w-full py-3 border-2 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 font-semibold text-sm transition-all"
            >
              Vaciar carrito
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}

/**
 * Estado vacío del carrito.
 * 
 * Se muestra cuando no hay items en el carrito.
 * 
 * @returns {JSX.Element}
 */
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        Tu carrito está vacío
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
        Agrega productos y te aparecerán aquí
      </p>
    </div>
  );
}

/**
 * Icono de carrito de compras.
 * @returns {JSX.Element}
 */
function CartIcon() {
  return React.createElement('lord-icon', {
    src: "/wired-outline-146-trolley-hover-jump.json",
    trigger: "hover",
    colors: "primary:#1c6554,secondary:#1c6554",
    style: { width: "24px", height: "24px" }
  });
}

/**
 * Icono de cerrar/X.
 * @returns {JSX.Element}
 */
function CloseIcon() {
  return (
    <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/**
 * Icono de papelera/eliminar.
 * @returns {JSX.Element}
 */
function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

/**
 * Icono de check/verificación.
 * @returns {JSX.Element}
 */
function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
