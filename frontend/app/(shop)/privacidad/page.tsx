import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Política de privacidad | New Era Supermercado',
  description: 'Política de privacidad y tratamiento de datos de New Era Supermercado.',
};

const SECTIONS = [
  {
    heading: '1. Datos que recopilamos',
    content:
      'Recopilamos información de contacto (nombre, correo, dirección de entrega) y datos de uso de la plataforma para procesar pedidos y mejorar tu experiencia.',
  },
  {
    heading: '2. Uso de la información',
    content:
      'Utilizamos tus datos para gestionar pedidos, comunicar el estado de entregas, ofrecer soporte y, con tu consentimiento, enviar promociones relevantes.',
  },
  {
    heading: '3. Almacenamiento local',
    content:
      'El carrito de compras se guarda en tu navegador (localStorage) para que puedas retomar tu compra. Puedes vaciarlo en cualquier momento desde la aplicación.',
  },
  {
    heading: '4. Tus derechos',
    content:
      'Puedes solicitar acceso, corrección o eliminación de tus datos personales escribiéndonos a través de los canales de contacto oficiales de New Era Supermercado.',
  },
];

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      description="Última actualización: junio 2026. Conoce cómo protegemos y utilizamos tu información."
      sections={SECTIONS}
    />
  );
}
