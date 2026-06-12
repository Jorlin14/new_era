/**
 * Upload Configuration - New Era Supermercado
 * 
 * Configuración de Multer para subida de imágenes de productos.
 * Las imágenes se guardan en /backend/uploads/products/
 * 
 * @module config/upload
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio donde se guardarán las imágenes
const UPLOAD_DIR = path.join(__dirname, '../../uploads/products');

// Crear directorio si no existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Configuración de almacenamiento de multer (en Memoria)
 * Esto permite guardar las imágenes como Base64 en la Base de Datos
 */
const storage = multer.memoryStorage();

/**
 * Filtro de archivos permitidos
 * Solo acepta imágenes JPG, JPEG, PNG, GIF, WEBP
 */
const fileFilter = (req, file, cb) => {
  // Tipos MIME permitidos
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagen no permitido. Solo JPG, PNG, GIF o WEBP'), false);
  }
};

/**
 * Configuración completa de Multer
 * 
 * Límites:
 * - Tamaño máximo: 5MB
 * - Solo 1 archivo a la vez
 * - Solo imágenes permitidas
 */
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

export function deleteImage(imageUrl) {
  if (!imageUrl) return false;
  
  // Si es base64, no hay nada que borrar del sistema de archivos
  if (imageUrl.startsWith('data:')) return true;

  try {
    // Extraer el nombre del archivo de la URL
    // Ejemplo: http://localhost:3000/uploads/products/product-123.jpg -> product-123.jpg
    const filename = imageUrl.split('/').pop();
    const filePath = path.join(UPLOAD_DIR, filename);

    // Verificar si el archivo existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Imagen eliminada: ${filename}`);
      return true;
    }
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error.message);
    return false;
  }

  return false;
}
