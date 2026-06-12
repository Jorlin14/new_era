/**
 * Upload Controller - New Era Supermercado
 * 
 * Controlador para manejar la subida de imágenes de productos.
 * 
 * @module controllers/upload
 */

import { AppError } from '../middlewares/error.middleware.js';

/**
 * Sube una imagen de producto
 * 
 * POST /api/upload/product-image
 * 
 * Body: FormData con campo 'image'
 * Returns: { success: true, data: { imageUrl: string } }
 */
export const uploadProductImage = async (req, res, next) => {
  try {
    // Verificar que se subió un archivo
    if (!req.file) {
      throw new AppError('No se proporcionó ninguna imagen', 400);
    }

    // Convertir el buffer a base64
    const base64Str = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64Str}`;

    res.status(200).json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        imageUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    next(error);
  }
};
