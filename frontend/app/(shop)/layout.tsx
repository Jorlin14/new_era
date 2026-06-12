/**
 * Shop Layout — New Era Supermercado
 *
 * Layout compartido de la tienda pública: contenido + footer + popup de promociones.
 *
 * @module app/(shop)/layout
 */

import Footer from '@/components/Footer';
import PromotionPopup from '@/components/PromotionPopup';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
      <Footer />
      <PromotionPopup />
    </div>
  );
}
