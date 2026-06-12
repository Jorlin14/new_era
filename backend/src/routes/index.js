/**
 * API Router — New Era Supermercado
 *
 * Monta todas las rutas bajo el prefijo /api.
 *
 * @module routes/index
 */

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import addressRoutes from './address.routes.js';
import uploadRoutes from './upload.routes.js';
import promotionRoutes from './promotion.routes.js';
import statsRoutes from './stats.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

/** Health check — GET /api/health */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/addresses', addressRoutes);
router.use('/upload', uploadRoutes);
router.use('/promotions', promotionRoutes);
router.use('/stats', statsRoutes);
router.use('/users', userRoutes);

export default router;
