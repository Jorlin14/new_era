/**
 * Cart Context Module - New Era Supermercado
 * 
 * Maneja el estado global del carrito de compras.
 * 
 * Características:
 * - Persistencia en localStorage
 * - Validación de stock
 * - Cálculos automáticos de totales
 * - Control del drawer lateral
 * - Restricción de acceso solo para usuarios autenticados
 * 
 * @module context/CartContext
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { CART_STORAGE_KEY } from '@/lib/constants';
import type { CartContextType, CartItem, Product } from '@/lib/types';
import Toast from '@/components/Toast';

/**
 * Contexto del carrito de compras.
 * @private
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Provider del contexto del carrito.
 * 
 * Debe envolver toda la aplicación para proporcionar acceso al carrito.
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Componentes hijos
 * 
 * @example
 * <CartProvider>
 *   <App />
 * </CartProvider>
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Función helper para verificar autenticación
  const isAuthenticated = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    return !!token;
  }, []);

  const pathname = usePathname();

  // Función helper para obtener el ID de usuario del token
  const getUserIdFromToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) return null;
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      return payload.id || payload.email || null;
    } catch {
      return null;
    }
  }, []);

  const getStorageKey = useCallback(() => {
    const userId = getUserIdFromToken();
    return userId ? `${CART_STORAGE_KEY}_${userId}` : CART_STORAGE_KEY;
  }, [getUserIdFromToken]);

  const loadCart = useCallback(() => {
    if (!isAuthenticated()) {
      setItems([]);
      setIsHydrated(true);
      return;
    }

    try {
      const key = getStorageKey();
      const stored = localStorage.getItem(key);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
    setIsHydrated(true);
  }, [isAuthenticated, getStorageKey]);

  // Cargar carrito al inicio, cuando cambia la ruta o hay evento de auth
  useEffect(() => {
    loadCart();

    const handleAuthChange = () => loadCart();
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [loadCart, pathname]);

  // Persistir SOLO cuando items cambie Y esté hidratado
  useEffect(() => {
    if (!isHydrated) return;
    
    if (!isAuthenticated()) {
      return;
    }

    try {
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(items));
    } catch {}
  }, [items, isHydrated, isAuthenticated, getStorageKey]);

  /**
   * Agrega un producto al carrito.
   * Si ya existe, incrementa la cantidad en 1 (respetando el stock).
   * Solo permite agregar si el usuario está autenticado.
   */
  const addItem = useCallback((product: Product) => {
    if (!isAuthenticated()) {
      window.location.href = '/auth/login';
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          setToastMessage('No hay más stock disponible');
          setToastType('warning');
          setShowToast(true);
          return prev;
        }
        
        setToastMessage('Producto agregado al carrito');
        setToastType('success');
        setShowToast(true);
        
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      setToastMessage('Producto agregado al carrito');
      setToastType('success');
      setShowToast(true);
      
      return [...prev, { product, quantity: 1 }];
    });
  }, [isAuthenticated]);

  /**
   * Remueve completamente un producto del carrito.
   */
  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  /**
   * Actualiza la cantidad de un producto.
   * Si quantity <= 0, remueve el producto del carrito.
   * Respeta el stock máximo disponible.
   */
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    );
  }, []);

  /**
   * Vacía el carrito completamente.
   */
  const clearCart = useCallback(() => setItems([]), []);

  // Cálculo del total de unidades en el carrito
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  // Cálculo del precio total (subtotal sin envío)
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isOpen,
      setIsOpen,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </CartContext.Provider>
  );
}

/**
 * Hook para acceder al contexto del carrito.
 * 
 * Debe usarse dentro de un componente envuelto por CartProvider.
 * 
 * @returns {CartContextType} Contexto del carrito
 * @throws {Error} Si se usa fuera de un CartProvider
 * 
 * @example
 * function ProductCard() {
 *   const { addItem, totalItems } = useCart();
 *   
 *   return (
 *     <button onClick={() => addItem(product)}>
 *       Agregar al carrito ({totalItems})
 *     </button>
 *   );
 * }
 */
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
}
