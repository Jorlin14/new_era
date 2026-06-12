import Joi from 'joi';

// CREATE CATEGORY SCHEMA
export const createCategorySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': 'El nombre de la categoría debe tener al menos 2 caracteres.',
      'string.max': 'El nombre de la categoría no puede superar los 50 caracteres.',
      'any.required': 'El nombre de la categoría es obligatorio.',
    }),
});

// UPDATE CATEGORY SCHEMA (PARTIAL)
export const updateCategorySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .messages({
      'string.min': 'El nombre de la categoría debe tener al menos 2 caracteres.',
      'string.max': 'El nombre de la categoría no puede superar los 50 caracteres.',
    }),
}).min(1).messages({
  'object.min': 'Debés enviar al menos un campo para actualizar.',
});

// CATEGORY QUERY SCHEMA
export const categoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});