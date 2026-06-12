import { Router } from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validators/product.validator.js';
import * as productController from '../controllers/product.controller.js';

const router = Router();

// PUBLIC
router.get('/', validate(productQuerySchema, 'query'), productController.getAllProducts);
router.get('/:id', productController.getProductById);

// ADMIN
router.post('/', verifyToken, checkRole('ADMIN'), validate(createProductSchema), productController.createProduct);
router.patch('/:id', verifyToken, checkRole('ADMIN'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', verifyToken, checkRole('ADMIN'), productController.deleteProduct);

export default router;