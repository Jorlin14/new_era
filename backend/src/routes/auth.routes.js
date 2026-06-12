/**
 * Auth Routes — /api/auth
 *
 * @module routes/auth
 */

import { Router } from 'express';
import { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword,
  updatePassword,
  updateProfile
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema
} from '../validators/auth.validator.js';

const router = Router();

// Rutas públicas
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Rutas protegidas
router.get('/me', verifyToken, getMe);
router.patch('/me', verifyToken, validate(updateProfileSchema), updateProfile);
router.patch('/me/password', verifyToken, validate(updatePasswordSchema), updatePassword);

export default router;
