import { Router } from 'express';
import { verifyToken, checkRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { userQuerySchema, updateUserSchema } from '../validators/user.validator.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

// Todas las rutas de usuarios requieren permisos de ADMIN
router.use(verifyToken, checkRole('ADMIN'));

router.get('/', validate(userQuerySchema, 'query'), userController.getAllUsers);
router.patch('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
