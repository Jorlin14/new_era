/**
 * Auth Service — New Era Supermercado
 *
 * Lógica de registro, login, recuperación de contraseña y generación de tokens JWT.
 *
 * @module services/auth
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { sendPasswordResetEmail } from '../utils/email.js';

const SALT_ROUNDS = 12;
const RESET_TOKEN_EXPIRY_HOURS = 1; // Token válido por 1 hora

/** Registra un usuario nuevo y devuelve token JWT */
export const registerUser = async ({ name, email, password, phone }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError('Ya existe una cuenta con ese email.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const token = signToken({ sub: newUser.id, role: newUser.role });

  return { user: newUser, token };
};

/** Autentica credenciales y devuelve token JWT */
export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Credenciales incorrectas.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Tu cuenta ha sido desactivada. Contacta al soporte.', 403);
  }

  const token = signToken({ sub: user.id, role: user.role });
  const { password: _removed, ...safeUser } = user;

  return { user: safeUser, token };
};

/** Firma un token JWT con la clave del entorno */
const signToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno.');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/** Solicita recuperación de contraseña - Genera token y envía email */
export const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, isActive: true },
  });

  // Por seguridad, no revelamos si el email existe o no
  if (!user) {
    return { message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.' };
  }

  if (!user.isActive) {
    throw new AppError('Tu cuenta ha sido desactivada. Contacta al soporte.', 403);
  }

  // Generar token seguro de 32 bytes
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Token expira en 1 hora
  const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Guardar token hasheado en BD
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry,
    },
  });

  // Enviar email con el token (sin hashear)
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  
  try {
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });
  } catch (error) {
    // Si falla el envío, eliminar el token de la BD
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    throw new AppError('Error al enviar el correo. Intenta nuevamente.', 500);
  }

  return { message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.' };
};

/** Restablece la contraseña con el token válido */
export const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new AppError('Token y nueva contraseña son requeridos.', 400);
  }

  // Hashear el token recibido para comparar con la BD
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Buscar usuario con token válido y no expirado
  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: {
        gt: new Date(), // Mayor que la fecha actual
      },
      isActive: true,
    },
  });

  if (!user) {
    throw new AppError('Token inválido o expirado.', 400);
  }

  // Encriptar nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Actualizar contraseña y limpiar campos de reset
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' };
};

/** Actualiza la contraseña del usuario autenticado */
export const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    throw new AppError('La contraseña actual es incorrecta.', 401);
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return { message: 'Contraseña actualizada correctamente.' };
};

/** Actualiza el perfil del usuario autenticado */
export const updateProfile = async (userId, data) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
    },
  });

  return { message: 'Perfil actualizado correctamente.', user: updatedUser };
};
