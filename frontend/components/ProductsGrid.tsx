/**
 * Products Grid Component - New Era Supermercado
 * 
 * Grid de productos con scroll infinito estilo Mercado Libre:
 * - Carga progresiva al hacer scroll
 * - Sin límites artificiales
 * - Lazy loading automático
 * - Filtros por búsqueda y categoría
 * 
 * @module components/ProductsGrid
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getProducts } from '@/lib/api';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

interface ProductsGridProps {
  searchQuery: string;
  selectedCategory: string | null;
}

const SKELETON_COUNT = 20;
const PRODUCTS_PER_PAGE = 24;

export default function ProductsGrid({ searchQuery, selectedCategory }: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Cargar productos cuando cambien los filtros
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setPage(1);
    setHasMore(true);

    getProducts(searchQuery || undefined, selectedCategory || undefined, 1, PRODUCTS_PER_PAGE)
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setHasMore(data.length === PRODUCTS_PER_PAGE);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedCategory]);

  // Cargar más productos desde el servidor
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    
    getProducts(searchQuery || undefined, selectedCategory || undefined, nextPage, PRODUCTS_PER_PAGE)
      .then((data) => {
        setProducts(prev => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(data.length === PRODUCTS_PER_PAGE);
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  }, [page, hasMore, isLoadingMore, searchQuery, selectedCategory]);

  // Intersection Observer para detectar scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isLoadingMore && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, isLoading, isLoadingMore, hasMore]);

  const title = searchQuery
    ? `Resultados para "${searchQuery}"`
    : selectedCategory
    ? 'Productos de la categoría'
    : 'Todos los productos';

  const countLabel = isLoading
    ? 'Cargando...'
    : hasMore
    ? `Mostrando ${products.length} productos...`
    : `${products.length} ${products.length === 1 ? 'producto' : 'productos'}`;

  return (
    <section className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-900" id="productos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{countLabel}</p>
        </header>

        {isLoading ? (
          <ProductSkeletonGrid />
        ) : products.length === 0 ? (
          <EmptyProducts />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Target para Intersection Observer */}
            <div ref={observerTarget} className="mt-8 flex justify-center min-h-[40px]">
              {isLoadingMore && (
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="w-6 h-6 border-2 border-[#1c6554] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Cargando más productos...</span>
                </div>
              )}
              {!hasMore && products.length > 0 && (
                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#1c6554]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Has visto todos los productos
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="aspect-square bg-slate-100 dark:bg-slate-700 animate-shimmer" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-slate-100 dark:bg-slate-700 animate-shimmer" />
            <div className="h-3 bg-slate-100 dark:bg-slate-700 w-2/3 animate-shimmer" />
            <div className="h-6 bg-slate-100 dark:bg-slate-700 w-1/2 animate-shimmer" />
            <div className="h-10 bg-slate-100 dark:bg-slate-700 animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyProducts() {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        No encontramos productos
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
        Intenta con otra búsqueda o explora nuestras categorías
      </p>
    </div>
  );
}
