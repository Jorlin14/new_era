/**
 * Promotion Controller - New Era Supermercado
 * 
 * Controlador para gestionar promociones y popups del sistema.
 * 
 * @module controllers/promotion
 */

import prisma from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';

/**
 * Obtener todas las promociones (con filtros opcionales)
 * 
 * GET /api/promotions
 * Query params: onlyActive (boolean), page, limit
 * 
 * Returns: { success: true, data: Promotion[], meta: {...} }
 */
export const getPromotions = async (req, res, next) => {
  try {
    const { onlyActive, page = 1, limit = 10 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Construir filtros
    const where = {};
    
    if (onlyActive === 'true') {
      where.isActive = true;
      // Solo promociones actuales (entre startDate y endDate)
      where.startDate = { lte: new Date() };
      where.OR = [
        { endDate: null },
        { endDate: { gte: new Date() } }
      ];
    }

    // Contar total
    const total = await prisma.promotion.count({ where });

    // Obtener promociones ordenadas por prioridad (mayor primero) y luego por fecha de creación
    const promotions = await prisma.promotion.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take,
    });

    res.status(200).json({
      success: true,
      data: promotions,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener una promoción por ID
 * 
 * GET /api/promotions/:id
 * 
 * Returns: { success: true, data: Promotion }
 */
export const getPromotionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const promotion = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!promotion) {
      throw new AppError('Promoción no encontrada', 404);
    }

    res.status(200).json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear nueva promoción (ADMIN)
 * 
 * POST /api/promotions
 * Body: { title, description, imageUrl?, ctaText?, ctaLink?, startDate?, endDate?, priority? }
 * 
 * Returns: { success: true, data: Promotion }
 */
export const createPromotion = async (req, res, next) => {
  try {
    const {
      title,
      description,
      imageUrl,
      ctaText,
      ctaLink,
      startDate,
      endDate,
      priority,
    } = req.body;

    const promotion = await prisma.promotion.create({
      data: {
        title,
        description,
        imageUrl,
        ctaText: ctaText || 'Ver más',
        ctaLink,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        priority: priority ? Number(priority) : 0,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Promoción creada exitosamente',
      data: promotion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar promoción (ADMIN)
 * 
 * PATCH /api/promotions/:id
 * Body: { title?, description?, imageUrl?, ctaText?, ctaLink?, isActive?, startDate?, endDate?, priority? }
 * 
 * Returns: { success: true, data: Promotion }
 */
export const updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      imageUrl,
      ctaText,
      ctaLink,
      isActive,
      startDate,
      endDate,
      priority,
    } = req.body;

    // Verificar que existe
    const existing = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Promoción no encontrada', 404);
    }

    // Construir data de actualización
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (ctaText !== undefined) data.ctaText = ctaText;
    if (ctaLink !== undefined) data.ctaLink = ctaLink;
    if (isActive !== undefined) data.isActive = isActive;
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (priority !== undefined) data.priority = Number(priority);

    const updated = await prisma.promotion.update({
      where: { id },
      data,
    });

    res.status(200).json({
      success: true,
      message: 'Promoción actualizada exitosamente',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar promoción (ADMIN)
 * 
 * DELETE /api/promotions/:id
 * 
 * Returns: { success: true, message: string }
 */
export const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que existe
    const existing = await prisma.promotion.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Promoción no encontrada', 404);
    }

    await prisma.promotion.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Promoción eliminada exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener promoción activa para mostrar en popup (público)
 * 
 * GET /api/promotions/active/popup
 * 
 * Retorna la promoción activa con mayor prioridad que esté dentro de su rango de fechas
 * 
 * Returns: { success: true, data: Promotion | null }
 */
export const getActivePopupPromotion = async (req, res, next) => {
  try {
    const now = new Date();

    const promotion = await prisma.promotion.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ],
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    res.status(200).json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    next(error);
  }
};
