/**
 * Seed de Promociones - New Era Supermercado
 * 
 * Script para poblar la tabla de promociones con datos de ejemplo.
 * Ejecutar con: node prisma/seed-promotions.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const promotions = [
  {
    title: 'Productos Frescos Diarios',
    description: 'Recibe productos frescos del campo directamente a tu casa. Calidad garantizada.',
    imageUrl: null,
    ctaText: 'Explorar catálogo',
    ctaLink: '/productos',
    isActive: true,
    priority: 10,
    startDate: new Date(),
    endDate: null,
  },
  {
    title: '¡Envío Gratis en Compras Mayores a $50.000!',
    description: 'Aprovecha nuestro envío gratis en todas tus compras superiores a $50.000. Válido hasta fin de mes.',
    imageUrl: null,
    ctaText: 'Comprar ahora',
    ctaLink: '/productos',
    isActive: false,
    priority: 5,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
  },
  {
    title: 'Frutas y Verduras Frescas',
    description: 'Descubre nuestra selección de frutas y verduras de la mejor calidad. ¡Llegamos en menos de 30 minutos!',
    imageUrl: null,
    ctaText: 'Ver ofertas',
    ctaLink: '/productos?categoria=frutas-verduras',
    isActive: false,
    priority: 3,
    startDate: new Date(),
    endDate: null,
  },
];

async function seedPromotions() {
  console.log('🌱 Sembrando promociones...');

  try {
    for (const promo of promotions) {
      const created = await prisma.promotion.create({
        data: promo,
      });
      console.log(`✅ Creada: ${created.title}`);
    }

    console.log('\n🎉 ¡Promociones sembradas exitosamente!');
    console.log(`📊 Total de promociones: ${promotions.length}`);
  } catch (error) {
    console.error('❌ Error al sembrar promociones:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPromotions();
