import { Router } from 'express';
import { getDashboardStats } from '../controllers/stats.controller.js';
import { verifyToken, checkRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas de estadísticas requieren autenticación y rol de ADMIN
router.use(verifyToken);
router.use(checkRole('ADMIN'));

router.get('/dashboard', getDashboardStats);

export default router;
