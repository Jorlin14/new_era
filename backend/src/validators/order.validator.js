import Joi from 'joi';

// CREATE ORDER SCHEMA
export const createOrderSchema = Joi.object({
  addressId: Joi.string()
    .uuid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.uuid': 'El ID de dirección debe ser un UUID válido.',
      'any.required': 'La dirección de entrega es obligatoria.',
    }),

  distance: Joi.number()
    .positive()
    .max(15)
    .precision(2)
    .required()
    .messages({
      'number.base': 'La distancia debe ser un número.',
      'number.positive': 'La distancia debe ser mayor a 0.',
      'number.max': 'Lo sentimos, estás fuera de nuestra zona de cobertura (máximo 15 km).',
      'any.required': 'La distancia de entrega es obligatoria.',
    }),

  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string()
          .uuid({ version: 'uuidv4' })
          .required()
          .messages({
            'string.uuid': 'Cada productId debe ser un UUID válido.',
            'any.required': 'El productId es obligatorio en cada ítem.',
          }),

        quantity: Joi.number()
          .integer()
          .min(1)
          .max(99)
          .required()
          .messages({
            'number.base': 'La cantidad debe ser un número.',
            'number.integer': 'La cantidad debe ser un número entero.',
            'number.min': 'La cantidad mínima por producto es 1.',
            'number.max': 'La cantidad máxima por producto es 99.',
            'any.required': 'La cantidad es obligatoria en cada ítem.',
          }),
      })
    )
    .min(1)
    .max(50)
    .unique('productId')
    .required()
    .messages({
      'array.min': 'La orden debe tener al menos un producto.',
      'array.max': 'La orden no puede tener más de 50 ítems distintos.',
      'array.unique': 'Hay productos duplicados en la orden. Ajustá la cantidad en un solo ítem.',
      'any.required': 'Los ítems de la orden son obligatorios.',
    }),
});

// UPDATE ORDER STATUS SCHEMA
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'PAID', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED')
    .required()
    .messages({
      'any.only': 'Estado inválido. Los estados válidos son: PENDING, PAID, PREPARING, DISPATCHED, DELIVERED, CANCELLED.',
      'any.required': 'El estado es obligatorio.',
    }),
});

// ORDER QUERY SCHEMA
export const orderQuerySchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'PAID', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED')
    .optional(),

  page:  Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(1000).default(10),
});