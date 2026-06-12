import Joi from 'joi';

// CREATE PRODUCT SCHEMA
export const createProductSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(150)
    .trim()
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres.',
      'string.max': 'El nombre no puede superar los 150 caracteres.',
      'any.required': 'El nombre del producto es obligatorio.',
    }),

  description: Joi.string()
    .max(1000)
    .trim()
    .optional()
    .allow('')
    .messages({
      'string.max': 'La descripción no puede superar los 1000 caracteres.',
    }),

  price: Joi.number()
    .positive()
    .min(0.01)
    .precision(2)
    .required()
    .messages({
      'number.base': 'El precio debe ser un número.',
      'number.positive': 'El precio debe ser un valor positivo.',
      'number.min': 'El precio mínimo es 0.01.',
      'any.required': 'El precio es obligatorio.',
    }),

  stock: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.integer': 'El stock debe ser un número entero.',
      'number.min': 'El stock no puede ser negativo.',
    }),

  imageUrl: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('')
    .messages({
      'string.uri': 'La URL de la imagen no es válida. Debe comenzar con http:// o https://.',
    }),

  categoryId: Joi.string()
    .uuid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.uuid': 'El ID de categoría debe ser un UUID válido.',
      'any.required': 'El ID de categoría es obligatorio.',
    }),
});

// UPDATE PRODUCT SCHEMA
export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(150).trim()
    .messages({ 'string.min': 'El nombre debe tener al menos 2 caracteres.' }),

  description: Joi.string().max(1000).trim().allow(''),

  price: Joi.number().positive().min(0.01).precision(2)
    .messages({
      'number.positive': 'El precio debe ser positivo.',
      'number.min': 'El precio mínimo es 0.01.',
    }),

  stock: Joi.number().integer().min(0)
    .messages({ 'number.min': 'El stock no puede ser negativo.' }),

  imageUrl: Joi.string().uri({ scheme: ['http', 'https'] }).allow(''),

  categoryId: Joi.string().uuid({ version: 'uuidv4' })
    .messages({ 'string.uuid': 'El ID de categoría debe ser un UUID válido.' }),

  isActive: Joi.boolean(),
}).min(1).messages({
  'object.min': 'Debes enviar al menos un campo para actualizar.',
});

// PRODUCT QUERY SCHEMA
export const productQuerySchema = Joi.object({
  search: Joi.string().trim().max(100).optional(),

  categoryId: Joi.string().uuid({ version: 'uuidv4' }).optional()
    .messages({ 'string.uuid': 'El categoryId del filtro debe ser un UUID válido.' }),

  onlyActive: Joi.boolean().default(true),

  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(1000).default(12),

  sortBy: Joi.string()
    .valid('name', 'price', 'stock', 'createdAt')
    .default('createdAt')
    .messages({ 'any.only': 'sortBy debe ser: name, price, stock o createdAt.' }),

  order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({ 'any.only': 'order debe ser "asc" o "desc".' }),
});