/**
 * Shop Home Page - New Era Supermercado
 * 
 * Landing page principal de la tienda con:
 * - Banner de promociones activas
 * - Header con búsqueda
 * - Hero carousel
 * - Categorías
 * - Grid de productos
 * 
 * @module app/(shop)/page
 */

'use client';

import { useCallback, useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import ProductsGrid from '@/components/ProductsGrid';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, []);

  return (
    <>
      <Header onSearch={handleSearch} />
      
      <section id="hero">
        <Hero />
      </section>
      <section id="categorias">
        <Categories
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      </section>
      <section id="productos">
        <ProductsGrid searchQuery={searchQuery} selectedCategory={selectedCategory} />
      </section>
    </>
  );
}

