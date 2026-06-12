/**
 * Hero Slides Data - New Era Supermercado
 * 
 * Configuración de slides para el carousel del hero banner.
 * 
 * Cada slide contiene:
 * - Título principal y subtítulo descriptivo
 * - Imagen local (almacenada en /public)
 * - Gradiente de fondo para el lado izquierdo
 * - CTA (Call to Action) button text
 * 
 * Las imágenes se muestran en el lado derecho del hero
 * mientras el texto queda en el lado izquierdo sobre un gradiente verde.
 * 
 * @module lib/data/hero-slides
 */

/**
 * Estructura de un slide del hero carousel.
 */
export interface HeroSlide {
  /** ID único del slide */
  id: number;
  /** Título principal (grande y bold) */
  title: string;
  /** Descripción complementaria */
  description: string;
  /** Texto del botón CTA */
  cta: string;
  /** URL de la imagen del producto (local en /public) */
  image: string;
}

/**
 * Array de slides para el hero carousel.
 * 
 * Se rotan automáticamente cada 6 segundos.
 * Las imágenes son locales y se muestran en el costado derecho del hero.
 * 
 * @example
 * // Usar en Hero component
 * import { HERO_SLIDES } from '@/lib/data/hero-slides';
 * 
 * function Hero() {
 *   const [currentIndex, setCurrentIndex] = useState(0);
 *   const slide = HERO_SLIDES[currentIndex];
 *   return <div>{slide.title}</div>;
 * }
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: 'Frescura de la granja a tu puerta en minutos',
    description:
      'Descubre nuestra selección de productos locales, orgánicos y de la más alta calidad. Tu supermercado favorito, ahora más fácil.',
    cta: 'Comprar Ahora',
    image: '/hero-slide-1.png',
  },
  {
    id: 2,
    title: 'Entrega rápida directo a tu hogar',
    description:
      'Recibe tus productos frescos en menos de 30 minutos. Hacemos tus compras del súper por ti.',
    cta: 'Pedir Ahora',
    image: '/hero-slide-2.png',
  },
  {
    id: 3,
    title: 'Las mejores ofertas en frutas tropicales',
    description:
      'Ahorra hasta 40% en productos seleccionados. Ofertas exclusivas cada semana en tu mercado de confianza.',
    cta: 'Ver Ofertas',
    image: '/hero-slide-3.png',
  },
];
