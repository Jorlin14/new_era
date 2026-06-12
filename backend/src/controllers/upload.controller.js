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

    // Construir URL pública de la imagen
    // Opción 1: URL relativa (recomendada para evitar problemas CORS)
    const imageUrl = `/uploads/products/${req.file.filename}`;
    
    // Opción 2: URL absoluta con el backend
    // const port = process.env.PORT || 4000;
    // const baseUrl = `${req.protocol}://${req.hostname}:${port}`;
    // const imageUrl = `${baseUrl}/uploads/products/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    next(error);
  }
};
