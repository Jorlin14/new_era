/**
 * PromotionPopup Component - New Era Supermercado
 * 
 * Componente que muestra un popup con carrusel de promociones activas.
 * Se muestra automáticamente con todas las promociones activas.
 * 
 * @module components/PromotionPopup
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPromotions } from '@/lib/api';
import { getImageUrl } from '@/lib/constants';
import type { Promotion } from '@/lib/types';

export default function PromotionPopup() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadPromotions();
  }, []); // Solo cargar una vez al montar

  // Auto-avanzar cada 5 segundos
  useEffect(() => {
    if (!isVisible || promotions.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isVisible, promotions.length]);

  async function loadPromotions() {
    try {
      const { data: allPromotions } = await getPromotions({ onlyActive: true });
      
      console.log('[PromotionPopup] Loaded promotions:', allPromotions);
      
      if (!allPromotions || allPromotions.length === 0) {
        console.log('[PromotionPopup] No active promotions found');
        return;
      }

      // Ordenar por prioridad (mayor primero)
      const sorted = allPromotions.sort((a: Promotion, b: Promotion) => b.priority - a.priority);
      
      setPromotions(sorted);
      
      // Log image URLs for debugging
      sorted.forEach((promo: Promotion) => {
        console.log(`[PromotionPopup] Promotion "${promo.title}" imageUrl:`, promo.imageUrl);
      });
      
      // Mostrar popup con animación después de 1 segundo
      setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);
    } catch (error) {
      console.error('[PromotionPopup] Error:', error);
    }
  }

  function handleClose() {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  }

  /**
   * Maneja el click en el botón CTA (Call-to-Action)
   * Soporta:
   * - Enlaces a otras páginas: /productos, /categorias
   * - Scroll a secciones de la misma página: #productos, #categorias, #hero
   */
  function handleCTA() {
    if (!promotions[currentIndex]) return;
    
    const promotion = promotions[currentIndex];
    handleClose();
    
    const link = promotion.ctaLink;
    if (link) {
      // Si el enlace es un hash (#productos, #categorias, etc.)
      if (link.startsWith('#')) {
        // Esperar a que se cierre el popup antes de hacer scroll
        setTimeout(() => {
          const element = document.querySelector(link);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 400);
      } else {
        // Si es una ruta completa (/productos, /categorias, etc.)
        router.push(link);
      }
    }
  }

  function goToSlide(index: number) {
    setCurrentIndex(index);
  }

  function nextSlide() {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  }

  function prevSlide() {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  }

  if (!isVisible || promotions.length === 0) {
    return null;
  }

  const promotion = promotions[currentIndex];

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${
      isAnimating ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={`relative bg-slate-900 max-w-2xl w-full overflow-hidden shadow-2xl transform transition-all duration-300 ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors rounded-full"
          aria-label="Cerrar"
        >
          <CloseIcon />
        </button>

        {/* Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-block px-3 py-1 bg-[#1c6554] text-white text-xs font-bold uppercase tracking-wider rounded">
            Promoción Activa {promotions.length > 1 && `(${currentIndex + 1}/${promotions.length})`}
          </span>
        </div>

        {/* Carousel Navigation - Arrows */}
        {promotions.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors rounded-full"
              aria-label="Anterior"
            >
              <ChevronLeftIcon />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors rounded-full"
              aria-label="Siguiente"
            >
              <ChevronRightIcon />
            </button>
          </>
        )}

        {/* Content */}
        <div className="grid md:grid-cols-2">
          {/* Image Side */}
          <div className="relative h-64 md:h-auto bg-slate-800">
            {promotion.imageUrl && !imageError[promotion.id] ? (
              <img
                key={promotion.id}
                src={getImageUrl(promotion.imageUrl) || ''}
                alt={promotion.title}
                className="w-full h-full object-cover transition-opacity duration-500"
                onError={(e) => {
                  console.error(`[PromotionPopup] Failed to load image for "${promotion.title}":`, promotion.imageUrl);
                  console.error('[PromotionPopup] Resolved URL:', getImageUrl(promotion.imageUrl));
                  setImageError(prev => ({ ...prev, [promotion.id]: true }));
                }}
                onLoad={() => {
                  console.log(`[PromotionPopup] Successfully loaded image for "${promotion.title}"`);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col gap-3">
                <div className="text-slate-600">
                  <ImageIcon />
                </div>
                {imageError[promotion.id] && (
                  <p className="text-slate-500 text-sm">No se pudo cargar la imagen</p>
                )}
              </div>
            )}
            {/* Gradient Overlay on mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent md:hidden" />
          </div>

          {/* Text Side */}
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <h2 
              key={`title-${promotion.id}`}
              className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
            >
              {promotion.title}
            </h2>
            
            <p 
              key={`desc-${promotion.id}`}
              className="text-slate-300 text-base md:text-lg mb-6 leading-relaxed"
            >
              {promotion.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCTA}
                className="px-6 py-3 bg-[#1c6554] hover:bg-[#1c6554]/90 text-white font-semibold transition-all hover:scale-105 transform rounded"
              >
                {promotion.ctaText}
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-3 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium transition-colors rounded"
              >
                Cerrar
              </button>
            </div>

            {/* Priority Indicator (only for high priority) */}
            {promotion.priority >= 50 && (
              <div className="mt-6 flex items-center gap-2 text-amber-400 text-sm">
                <StarIcon />
                <span className="font-medium">Oferta destacada</span>
              </div>
            )}
          </div>
        </div>

        {/* Carousel Indicators */}
        {promotions.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {promotions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-[#1c6554]'
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Ir a promoción ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#0C447C] via-[#1c6554] to-[#0C447C]" />
      </div>
    </div>
  );
}
function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
