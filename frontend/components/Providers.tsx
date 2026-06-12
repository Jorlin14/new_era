/**
 * Providers Component - New Era Supermercado
 * 
 * Componente que envuelve la aplicación con todos los providers necesarios:
 * - CartProvider: Estado global del carrito de compras
 * 
 * @module components/Providers
 */

'use client';

import { CartProvider } from '@/context/CartContext';
import type { ReactNode } from 'react';

/**
 * Componente de providers para la aplicación.
 * 
 * Debe envolver el layout raíz para proporcionar contextos globales
 * a toda la aplicación.
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Componentes hijos de la app
 * @returns {JSX.Element}
 */
export default function Providers({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
