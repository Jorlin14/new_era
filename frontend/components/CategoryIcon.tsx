/**
 * Category Icon Component - New Era Supermercado
 * 
 * Componente que renderiza iconos SVG profesionales para cada categoría.
 * Cada icono está diseñado específicamente para representar visualmente
 * la categoría correspondiente.
 * 
 * @module components/CategoryIcon
 */

/**
 * Props del componente CategoryIcon.
 */
interface CategoryIconProps {
  /** Nombre de la categoría */
  name: string;
  /** Clases CSS personalizadas para tamaño y estilo */
  className?: string;
}

/**
 * Renderiza un icono SVG según el nombre de la categoría.
 * Si no hay coincidencia, muestra un icono genérico de caja.
 *
 * Categorías soportadas: Lácteos, Carnes, Verduras, Snacks, Bebidas,
 * Panadería, Abarrotes, Limpieza, Cuidado Personal, Congelados.
 */
export default function CategoryIcon({ name, className = "w-12 h-12" }: CategoryIconProps) {
  const iconClass = `${className} transition-all`;

  switch (name) {
    // Categoría: Lácteos (Leche, yogurt, queso)
    case 'Lácteos':
      return (
        <svg className={iconClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.1"/>
          {/* Caja de leche */}
          <rect x="22" y="16" width="20" height="28" rx="2" fill="#E0F2FE"/>
          {/* Tapa azul */}
          <rect x="22" y="16" width="20" height="6" rx="2" fill="#0EA5E9"/>
          {/* Líneas decorativas */}
          <path d="M26 26h12M26 30h12M26 34h12M26 38h12" stroke="#0284C7" strokeWidth="2" strokeLinecap="round"/>
          {/* Base */}
          <rect x="24" y="44" width="16" height="6" rx="1" fill="#BAE6FD"/>
        </svg>
      );

    // Categoría: Carnes (Pollo, res, pescado)
    case 'Carnes':
      return (
        <svg className={iconClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.1"/>
          {/* Pieza de carne exterior */}
          <path d="M32 16c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14z" fill="#FCA5A5"/>
          {/* Pieza de carne interior */}
          <path d="M32 20c-6 0-10 4-10 10s4 10 10 10 10-4 10-10-4-10-10-10z" fill="#EF4444"/>
          {/* Vetas de grasa 1 */}
          <ellipse cx="28" cy="28" rx="3" ry="4" fill="#FCA5A5" opacity="0.6"/>
          {/* Vetas de grasa 2 */}
          <ellipse cx="36" cy="32" rx="2.5" ry="3.5" fill="#FCA5A5" opacity="0.6"/>
          {/* Línea de corte */}
          <path d="M26 34c1 1.5 2.5 2.5 6 2.5s5-1 6-2.5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // Categoría: Verduras (Tomate, lechuga, vegetales)
    case 'Verduras':
      return (
        <svg className={iconClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.1"/>
          {/* Hojitas superiores */}
          <path d="M32 12c-2.5 0-4.5 1.5-5 3.5-.5-2-2.5-3.5-5-3.5-3 0-5.5 2.5-5.5 5.5 0 4 4.5 8.5 10.5 13.5 6-5 10.5-9.5 10.5-13.5 0-3-2.5-5.5-5.5-5.5z" fill="#22C55E"/>
          {/* Cuerpo del vegetal (manzana verde) exterior */}
          <ellipse cx="32" cy="38" rx="14" ry="16" fill="#86EFAC"/>
          {/* Cuerpo del vegetal interior */}
          <ellipse cx="32" cy="38" rx="11" ry="13" fill="#4ADE80"/>
          {/* Línea decorativa izquierda */}
          <path d="M28 32c0-1 .5-2 1.5-2.5.5-.3 1-.5 1.5-.5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Línea decorativa derecha */}
          <path d="M36 32c0-1-.5-2-1.5-2.5-.5-.3-1-.5-1.5-.5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // Categoría: Snacks (Papas fritas, frutos secos)
    case 'Snacks':
      return (
        <svg className={iconClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.1"/>
          {/* Bolsa de snacks */}
          <rect x="18" y="26" width="28" height="16" rx="2" fill="#FDE68A"/>
          {/* Parte superior de la bolsa */}
          <path d="M18 30c0-2 1-4 2-4h24c1 0 2 2 2 4" fill="#FEF08A"/>
          {/* Interior de la bolsa */}
          <rect x="20" y="28" width="24" height="12" rx="1" fill="#FBBF24"/>
          {/* Snacks dentro - círculo 1 */}
          <circle cx="26" cy="34" r="2" fill="#F59E0B"/>
          {/* Snacks dentro - círculo 2 */}
          <circle cx="32" cy="34" r="2" fill="#D97706"/>
          {/* Snacks dentro - círculo 3 */}
          <circle cx="38" cy="34" r="2" fill="#F59E0B"/>
          {/* Líneas decorativas */}
          <path d="M22 34h2M30 34h2M40 34h2" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // Categoría: Bebidas (Agua, jugos, gaseosas)
    case 'Bebidas':
      return (
        <svg className={iconClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.1"/>
          {/* Botella exterior */}
          <path d="M26 14h12l2 36h-16l2-36z" fill="#DBEAFE"/>
          {/* Parte transparente superior */}
          <path d="M26 14h12v8h-12v-8z" fill="#93C5FD"/>
          {/* Tapa de la botella */}
          <rect x="28" y="8" width="8" height="4" rx="1" fill="#60A5FA"/>
          {/* Líquido dentro */}
          <path d="M26 22h12v18c0 2-2 4-6 4s-6-2-6-4V22z" fill="#3B82F6"/>
          {/* Brillo en el líquido */}
          <ellipse cx="32" cy="28" rx="4" ry="2" fill="#BFDBFE" opacity="0.4"/>
          {/* Líneas de la tapa */}
          <path d="M30 10v4M34 10v4" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // Categoría: Panadería (Pan, croissant)
    case 'Panadería':
      return (
        <svg className={iconClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.1"/>
          {/* Parte superior del pan (forma curva) */}
          <path d="M20 38c0-8 5-14 12-14s12 6 12 14z" fill="#FED7AA"/>
          {/* Base del pan */}
          <path d="M20 38h24v8c0 2-1.5 4-4 4h-16c-2.5 0-4-2-4-4v-8z" fill="#FDBA74"/>
          {/* Marca en el pan 1 */}
          <ellipse cx="26" cy="32" rx="2" ry="3" fill="#F97316"/>
          {/* Marca en el pan 2 */}
          <ellipse cx="32" cy="30" rx="2" ry="3" fill="#F97316"/>
          {/* Marca en el pan 3 */}
          <ellipse cx="38" cy="32" rx="2" ry="3" fill="#F97316"/>
          {/* Línea central */}
          <path d="M22 42h20" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // Categoría: Abarrotes (Arroz, aceite, granos)
    case 'Abarrotes':
      return (
        <svg className={iconClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.1"/>
          {/* Caja/paquete exterior */}
          <rect x="20" y="20" width="24" height="28" rx="2" fill="#FEF3C7"/>
          {/* Etiqueta superior */}
          <rect x="20" y="20" width="24" height="8" rx="2" fill="#FDE047"/>
          {/* Líneas de texto en la etiqueta */}
          <path d="M24 32h16M24 36h16M24 40h16" stroke="#EAB308" strokeWidth="2" strokeLinecap="round"/>
          {/* Punto decorativo */}
          <circle cx="32" cy="24" r="2" fill="#CA8A04"/>
          {/* Base del paquete */}
          <rect x="28" y="42" width="8" height="4" rx="1" fill="#FEF08A"/>
        </svg>
      );

    // Categoría: Limpieza (Detergente, lavavajillas)
    case 'Limpieza':
      return (
        <svg className={iconClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.1"/>
          {/* Botella de detergente */}
          <path d="M26 14h12l4 36h-20l4-36z" fill="#E0E7FF"/>
          {/* Tapa de la botella */}
          <ellipse cx="32" cy="18" rx="8" ry="4" fill="#C7D2FE"/>
          {/* Líquido dentro */}
          <path d="M26 20h12v24c0 3-2 6-6 6s-6-3-6-6V20z" fill="#A5B4FC"/>
          {/* Burbujas 1 */}
          <ellipse cx="32" cy="28" rx="5" ry="2" fill="#E0E7FF" opacity="0.5"/>
          {/* Burbujas 2 */}
          <ellipse cx="32" cy="36" rx="4" ry="1.5" fill="#E0E7FF" opacity="0.5"/>
          {/* Cuello de la botella */}
          <rect x="30" y="12" width="4" height="4" rx="1" fill="#818CF8"/>
        </svg>
      );

    // Categoría: Cuidado Personal (Shampoo, jabón)
    case 'Cuidado Personal':
      return (
        <svg className={iconClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.1"/>
          {/* Botella de shampoo */}
          <rect x="24" y="20" width="16" height="26" rx="3" fill="#FDE68A"/>
          {/* Etiqueta de la botella */}
          <rect x="26" y="28" width="12" height="12" rx="2" fill="#FCD34D"/>
          {/* Tapa dosificadora */}
          <rect x="28" y="14" width="8" height="6" rx="2" fill="#F59E0B"/>
          {/* Pump/dispensador */}
          <rect x="30" y="10" width="4" height="4" rx="1" fill="#D97706"/>
          {/* Línea de nivel del líquido */}
          <path d="M26 42h12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
          {/* Detalles de la etiqueta */}
          <circle cx="32" cy="34" r="3" fill="#FBBF24" opacity="0.6"/>
        </svg>
      );

    // Categoría: Congelados (Papas fritas, helado)
    case 'Congelados':
      return (
        <svg className={iconClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.1"/>
          {/* Copo de nieve principal - centro */}
          <circle cx="32" cy="32" r="3" fill="#3B82F6"/>
          {/* Línea vertical */}
          <path d="M32 18v28" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round"/>
          {/* Línea horizontal */}
          <path d="M18 32h28" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round"/>
          {/* Línea diagonal 1 */}
          <path d="M22 22l20 20" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round"/>
          {/* Línea diagonal 2 */}
          <path d="M42 22l-20 20" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round"/>
          {/* Puntas del copo - arriba */}
          <path d="M32 18l-2 4m2-4l2 4" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
          {/* Puntas del copo - abajo */}
          <path d="M32 46l-2-4m2 4l2-4" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
          {/* Puntas del copo - izquierda */}
          <path d="M18 32l4-2m-4 2l4 2" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
          {/* Puntas del copo - derecha */}
          <path d="M46 32l-4-2m4 2l-4 2" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );

    // Categoría: Todos los productos (ícono genérico)
    case 'Todos los productos':
    default:
      return (
        <svg className={iconClass} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.1"/>
          {/* Caja genérica */}
          <rect x="18" y="22" width="28" height="24" rx="2" fill="#E0F2FE"/>
          {/* Tapa de la caja */}
          <path d="M18 30h28v-8c0-1-1-2-2-2H20c-1 0-2 1-2 2v8z" fill="#0EA5E9"/>
          {/* Compartimento 1 */}
          <rect x="20" y="32" width="10" height="10" rx="1" fill="#7DD3FC"/>
          {/* Compartimento 2 */}
          <rect x="34" y="32" width="10" height="10" rx="1" fill="#7DD3FC"/>
          {/* Asa de la caja */}
          <path d="M25 28L32 20l7 8" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Detalle decorativo */}
          <circle cx="32" cy="24" r="2" fill="#FEF3C7"/>
        </svg>
      );
  }
}
