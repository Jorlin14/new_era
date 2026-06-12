/**
 * Promotion Routes - New Era Supermercado
 * 
 * Rutas para gestionar promociones y popups del sistema.
 * 
 * @module routes/promotion
 */

import { Router } from 'express';
import * as promotionController from '../controllers/promotion.controller.js';
import { verifyToken, checkRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createPromotionSchema,
  updatePromotionSchema,
  promotionQuerySchema,
} from '../validators/promotion.validator.js';

const router = Router();

/**
 * GET /api/promotions/active/popup
 * Obtener promoción activa para popup (público)
 * No requiere autenticación
 */
router.get(
  '/active/popup',
  promotionController.getActivePopupPromotion
);

/**
 * GET /api/promotions
 * Listar promociones (con filtros)
 * Público: Solo activas
 * Admin: Todas
 */
router.get(
  '/',
  validate(promotionQuerySchema, 'query'),
  promotionController.getPromotions
);

/**
 * GET /api/promotions/:id
 * Obtener una promoción específica
 * No requiere autenticación
 */
router.get(
  '/:id',
  promotionController.getPromotionById
);

/**
 * POST /api/promotions
 * Crear nueva promoción
 * Requiere: ADMIN
 */
router.post(
  '/',
  verifyToken,
  checkRole('ADMIN'),
  validate(createPromotionSchema),
  promotionController.createPromotion
);

/**
 * PATCH /api/promotions/:id
 * Actualizar promoción
 * Requiere: ADMIN
 */
router.patch(
  '/:id',
  verifyToken,
  checkRole('ADMIN'),
  validate(updatePromotionSchema),
  promotionController.updatePromotion
);

/**
 * DELETE /api/promotions/:id
 * Eliminar promoción
 * Requiere: ADMIN
 */
router.delete(
  '/:id',
  verifyToken,
  checkRole('ADMIN'),
  promotionController.deletePromotion
);

export default router;
