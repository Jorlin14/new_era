/**
 * Debounce Hook - New Era Supermercado
 * 
 * Hook personalizado para aplicar debouncing a valores que cambian frecuentemente.
 * Útil para optimizar búsquedas y reducir llamadas a APIs.
 * 
 * @module hooks/useDebounce
 */

import { useEffect, useState } from 'react';

/**
 * Hook que retorna un valor debounced.
 * 
 * El valor debounced solo se actualiza después de que el usuario
 * deja de cambiar el valor original durante el tiempo especificado.
 * 
 * Útil para:
 * - Búsquedas en tiempo real (esperar que el usuario termine de escribir)
 * - Reducir llamadas a APIs
 * - Optimizar re-renders en componentes
 * 
 * @template T - Tipo del valor a debounce
 * @param {T} value - Valor a aplicar debounce
 * @param {number} [delayMs=300] - Tiempo de espera en milisegundos
 * @returns {T} Valor debounced
 * 
 * @example
 * function SearchInput() {
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 500);
 *   
 *   useEffect(() => {
 *     // Esta llamada solo se ejecuta 500ms después de que el usuario deja de escribir
 *     searchProducts(debouncedSearch);
 *   }, [debouncedSearch]);
 *   
 *   return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
 * }
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Crear timer que actualiza el valor después del delay
    const timer = setTimeout(() => setDebounced(value), delayMs);
    
    // Limpiar timer si el valor cambia antes de que se cumpla el delay
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
