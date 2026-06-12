/**
 * Hero Banner Component - New Era Supermercado
 * 
 * Banner principal de la landing page con diseño split:
 * - **Lado izquierdo:** Gradiente verde con título, descripción y botón CTA
 * - **Lado derecho:** Imagen del producto (carrusel)
 * - **Navegación:** Indicadores (dots) y flechas prev/next
 * 
 * Características:
 * - Carrusel automático cada 6 segundos
 * - Transiciones suaves con animaciones CSS
 * - Diseño responsivo (mobile: overlay, desktop: split)
 * - Soporte para dark mode
 * - Imágenes locales almacenadas en /public
 * 
 * @module components/Hero
 */

'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { HERO_SLIDES } from '@/lib/data/hero-slides';
import './Hero.css';

/** Intervalo entre slides automáticos (en milisegundos) */
const SLIDE_INTERVAL_MS = 6000;

/** Duración de la transición entre slides (en milisegundos) */
const TRANSITION_MS = 600;

/**
 * Componente de banner hero con carrusel y diseño split.
 * 
 * Muestra información destacada sobre el supermercado con un diseño
 * que divide la pantalla en dos: texto a la izquierda sobre gradiente verde
 * e imagen del producto a la derecha.
 * 
 * El carrusel cambia automáticamente cada 6 segundos y permite
 * navegación manual con dots e flechas.
 * 
 * @returns {JSX.Element}
 */
export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  /** Key que se incrementa para forzar re-render de animaciones CSS */
  const [animKey, setAnimKey] = useState(0);

  /**
   * Navega a un slide específico con animación.
   * Previene navegación durante transiciones activas.
   * 
   * @param {number} index - Índice del slide destino
   */
  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setAnimKey((k) => k + 1);
      setTimeout(() => setIsTransitioning(false), TRANSITION_MS);
    },
    [currentIndex, isTransitioning]
  );

  /**
   * Avanza al siguiente slide (con loop circular).
   */
  const nextSlide = useCallback(() => {
    const next = (currentIndex + 1) % HERO_SLIDES.length;
    setIsTransitioning(true);
    setCurrentIndex(next);
    setAnimKey((k) => k + 1);
    setTimeout(() => setIsTransitioning(false), TRANSITION_MS);
  }, [currentIndex]);

  /**
   * Retrocede al slide anterior (con loop circular).
   */
  const prevSlide = useCallback(() => {
    const prev = (currentIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    setIsTransitioning(true);
    setCurrentIndex(prev);
    setAnimKey((k) => k + 1);
    setTimeout(() => setIsTransitioning(false), TRANSITION_MS);
  }, [currentIndex]);

  // Configurar avance automático de slides
  useEffect(() => {
    const timer = setInterval(nextSlide, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = HERO_SLIDES[currentIndex];

  return (
    <section className="hero-section" aria-label="Banner principal" id="hero-carousel">
      <div className="hero-wrapper">
        <div className="hero-slide">
          {/* ====== LADO IZQUIERDO: Contenido de texto ====== */}
          <div className="hero-content">
            <h1 key={`title-${animKey}`} className="hero-title hero-title-anim">
              {slide.title}
            </h1>
            <p key={`desc-${animKey}`} className="hero-description hero-desc-anim">
              {slide.description}
            </p>
            <a
              key={`cta-${animKey}`}
              href="#productos"
              className="hero-cta hero-cta-anim"
            >
              {slide.cta}
            </a>
          </div>

          {/* ====== LADO DERECHO: Imagen del producto ====== */}
          <div className="hero-image-container">
            <div className="hero-image-wrapper hero-image-anim" key={`img-${animKey}`}>
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={currentIndex === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* ====== NAVEGACIÓN: Indicadores (dots) ====== */}
          <div className="hero-nav" role="tablist" aria-label="Slides del carrusel">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={`hero-dot ${index === currentIndex ? 'active' : ''}`}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Ir al slide ${index + 1} de ${HERO_SLIDES.length}`}
              />
            ))}
          </div>

          {/* ====== NAVEGACIÓN: Flechas prev/next ====== */}
          <div className="hero-arrows">
            <button
              type="button"
              onClick={prevSlide}
              className="hero-arrow"
              aria-label="Slide anterior"
              disabled={isTransitioning}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="hero-arrow"
              aria-label="Siguiente slide"
              disabled={isTransitioning}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
