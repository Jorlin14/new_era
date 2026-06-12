/**
 * Auth Controller — New Era Supermercado
 *
 * Maneja registro, login y perfil del usuario autenticado.
 *
 * @module controllers/auth
 */

import * as authService from '../services/auth.service.js';

/** POST /api/auth/register — Crear cuenta nueva */
export const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

/** POST /api/auth/login — Iniciar sesión */
export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.loginUser(req.body);

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/auth/me — Obtener usuario autenticado (requiere JWT) */
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
};

/** POST /api/auth/forgot-password — Solicitar recuperación de contraseña */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/** POST /api/auth/reset-password — Restablecer contraseña con token */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/auth/me/password — Actualizar contraseña */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const result = await authService.updatePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/auth/me — Actualizar perfil */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await authService.updateProfile(userId, req.body);

    res.status(200).json({
      success: true,
      message: result.message,
      data: { user: result.user },
    });
  } catch (error) {
    next(error);
  }
};
