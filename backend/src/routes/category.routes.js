import { Router } from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createCategorySchema, updateCategorySchema, categoryQuerySchema } from '../validators/category.validator.js';
import * as categoryController from '../controllers/category.controller.js';

const router = Router();

// PUBLIC
router.get('/', validate(categoryQuerySchema, 'query'), categoryController.getAllCategories);

// ADMIN
router.post('/', verifyToken, checkRole('ADMIN'), validate(createCategorySchema), categoryController.createCategory);
router.patch('/:id', verifyToken, checkRole('ADMIN'), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', verifyToken, checkRole('ADMIN'), categoryController.deleteCategory);

export default router;