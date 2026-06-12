/**
 * Promotion Validators - New Era Supermercado
 * 
 * Esquemas de validación para promociones usando Joi.
 * 
 * @module validators/promotion
 */

import Joi from 'joi';

/**
 * Schema para crear promoción
 */
export const createPromotionSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede superar 200 caracteres',
      'any.required': 'El título es obligatorio',
    }),

  description: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede superar 1000 caracteres',
      'any.required': 'La descripción es obligatoria',
    }),

  imageUrl: Joi.string()
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'La URL de la imagen debe ser una cadena de texto',
    }),

  ctaText: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'El texto del botón debe tener al menos 2 caracteres',
      'string.max': 'El texto del botón no puede superar 50 caracteres',
    }),

  ctaLink: Joi.string()
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'El enlace debe ser una cadena de texto',
    }),

  startDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'La fecha de inicio no es válida',
    }),

  endDate: Joi.date()
    .optional()
    .allow(null)
    .greater(Joi.ref('startDate'))
    .messages({
      'date.base': 'La fecha de fin no es válida',
      'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio',
    }),

  priority: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'La prioridad debe ser un número',
      'number.min': 'La prioridad mínima es 0',
      'number.max': 'La prioridad máxima es 100',
    }),
});

/**
 * Schema para actualizar promoción
 */
export const updatePromotionSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .optional()
    .messages({
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede superar 200 caracteres',
    }),

  description: Joi.string()
    .min(10)
    .max(1000)
    .optional()
    .messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede superar 1000 caracteres',
    }),

  imageUrl: Joi.string()
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'La URL de la imagen debe ser una cadena de texto',
    }),

  ctaText: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'El texto del botón debe tener al menos 2 caracteres',
      'string.max': 'El texto del botón no puede superar 50 caracteres',
    }),

  ctaLink: Joi.string()
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'El enlace debe ser una cadena de texto',
    }),

  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive debe ser verdadero o falso',
    }),

  startDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'La fecha de inicio no es válida',
    }),

  endDate: Joi.date()
    .optional()
    .allow(null)
    .messages({
      'date.base': 'La fecha de fin no es válida',
    }),

  priority: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'La prioridad debe ser un número',
      'number.min': 'La prioridad mínima es 0',
      'number.max': 'La prioridad máxima es 100',
    }),
});

/**
 * Schema para query params de listado
 */
export const promotionQuerySchema = Joi.object({
  onlyActive: Joi.string()
    .valid('true', 'false')
    .optional(),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10),
});
