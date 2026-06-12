'use client';

import { useEffect, useState, useRef } from 'react';
import { getCategories } from '@/lib/api';
import CategoryIcon from '@/components/CategoryIcon';
import type { Category } from '@/lib/types';

interface CategoriesProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function Categories({ selectedCategory, onSelectCategory }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Cargar categorías al montar
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const scrollAmount = 350; // Desplazamiento más corto y suave
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 relative group" id="categorias">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Explora por Categorías
          </h2>
          <button 
            type="button"
            className="text-sm font-medium text-[#1c6554] hover:underline"
            onClick={() => onSelectCategory(null)}
          >
            Ver todas
          </button>
        </div>

        {/* CSS para ocultar scrollbar pero permitir scroll */}
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}} />

        <div className="flex items-start gap-1 sm:gap-4 w-full">
          {/* Contenedor Flecha Izquierda (Mantiene el espacio aunque no haya flecha) */}
          <div className="hidden sm:flex w-10 flex-shrink-0 justify-center mt-[24px]">
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="cursor-pointer w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-md text-slate-600 dark:text-slate-300 hover:text-[#1c6554] dark:hover:text-[#2cb094] hover:scale-105 transition-transform"
                aria-label="Desplazar a la izquierda"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>

          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto hide-scrollbar gap-4 sm:gap-8 pb-4 pt-2 px-2 snap-x flex-grow w-full"
          >
            {/* Opción "Todas" */}
            <div 
              onClick={() => onSelectCategory(null)}
              className="flex flex-col items-center gap-3 cursor-pointer w-[100px] flex-shrink-0 snap-start"
            >
              <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-sm border ${
                selectedCategory === null 
                  ? 'bg-[#1c6554] border-[#1c6554]' 
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}>
                <CategoryIcon 
                  name="Todos" 
                  className={`w-8 h-8 ${selectedCategory === null ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`} 
                />
              </div>
              <span className={`text-xs sm:text-sm font-medium text-center leading-tight ${
                selectedCategory === null ? 'text-[#1c6554] dark:text-[#2cb094]' : 'text-slate-700 dark:text-slate-300'
              }`}>
                Todas
              </span>
            </div>

            {/* Lista de categorías */}
            {categories.map((category) => (
              <div 
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className="flex flex-col items-center gap-3 cursor-pointer w-[100px] flex-shrink-0 snap-start"
              >
                <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-sm border ${
                  selectedCategory === category.id 
                    ? 'bg-[#1c6554] border-[#1c6554]' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}>
                  <CategoryIcon 
                    name={category.name} 
                    className={`w-8 h-8 ${selectedCategory === category.id ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`} 
                  />
                </div>
                <span className={`text-xs sm:text-sm font-medium text-center leading-tight ${
                  selectedCategory === category.id ? 'text-[#1c6554] dark:text-[#2cb094]' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {category.name}
                </span>
              </div>
            ))}
          </div>

          {/* Contenedor Flecha Derecha */}
          <div className="hidden sm:flex w-10 flex-shrink-0 justify-center mt-[24px]">
            {canScrollRight && categories.length > 0 && (
              <button
                onClick={() => scroll('right')}
                className="cursor-pointer w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-md text-slate-600 dark:text-slate-300 hover:text-[#1c6554] dark:hover:text-[#2cb094] hover:scale-105 transition-transform"
                aria-label="Desplazar a la derecha"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
