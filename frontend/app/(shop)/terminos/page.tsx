import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Términos y condiciones | New Era Supermercado',
  description: 'Términos y condiciones de uso de New Era Supermercado.',
};

const SECTIONS = [
  {
    heading: '1. Uso del servicio',
    content:
      'Al utilizar New Era Supermercado aceptas usar la plataforma de forma responsable, proporcionar información veraz y cumplir con las leyes aplicables en Colombia.',
  },
  {
    heading: '2. Pedidos y pagos',
    content:
      'Los precios mostrados están en pesos colombianos (COP) e incluyen la información disponible al momento de la compra. Nos reservamos el derecho de actualizar precios y disponibilidad sin previo aviso.',
  },
  {
    heading: '3. Entregas',
    content:
      'Los tiempos de entrega son estimados y pueden variar según demanda, ubicación y condiciones externas. El envío es gratuito en compras superiores a $50.000 COP.',
  },
  {
    heading: '4. Cambios y devoluciones',
    content:
      'Si recibes un producto en mal estado o incorrecto, contáctanos dentro de las 24 horas posteriores a la entrega para gestionar el reemplazo o reembolso correspondiente.',
  },
];

export default function TerminosPage() {
  return (
    <LegalPage
      title="Términos y condiciones"
      description="Última actualización: junio 2026. Lee las condiciones que rigen el uso de nuestro servicio."
      sections={SECTIONS}
    />
  );
}
