/**
 * Upload Routes - New Era Supermercado
 * 
 * Rutas para subir archivos (imágenes de productos).
 * Solo administradores pueden subir imágenes.
 * 
 * @module routes/upload
 */

import { Router } from 'express';
import { upload } from '../config/upload.js';
import * as uploadController from '../controllers/upload.controller.js';
import { verifyToken, checkRole } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * POST /api/upload/product-image
 * Sube una imagen de producto
 * 
 * Auth: ADMIN
 * Body: FormData con campo 'image'
 * Response: { imageUrl: string }
 */
router.post(
  '/product-image',
  verifyToken,
  checkRole('ADMIN'),
  upload.single('image'), // Multer middleware - acepta 1 archivo con key 'image'
  uploadController.uploadProductImage
);

export default router;
