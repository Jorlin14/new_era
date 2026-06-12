/**
 * Auth Middleware — New Era Supermercado
 *
 * - verifyToken: valida JWT y adjunta el usuario a req.user
 * - checkRole: restringe acceso por rol (ADMIN, CASHIER, etc.)
 *
 * @module middlewares/auth
 */

import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

/** Verifica el token Bearer y carga el usuario en req.user */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado: Token no proporcionado.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'El usuario del token ya no existe.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Tu cuenta ha sido desactivada.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Sesión expirada. Inicia sesión de nuevo.' });
    }
    return res.status(401).json({ success: false, message: 'Token inválido o malformado.' });
  }
};

/** Middleware factory: permite solo los roles indicados */
export const checkRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(500).json({ success: false, message: 'Error interno: Falta verificar token.' });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Permisos insuficientes. Requiere: ${allowedRoles.join(' o ')}.`,
    });
  }

  next();
};
