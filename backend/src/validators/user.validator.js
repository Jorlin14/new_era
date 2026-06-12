import Joi from 'joi';

// UPDATE USER SCHEMA
export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres.',
    'string.max': 'El nombre no puede superar los 100 caracteres.',
  }),
  
  phone: Joi.string().max(20).trim().allow('').messages({
    'string.max': 'El teléfono no puede tener más de 20 caracteres.',
  }),

  role: Joi.string()
    .valid('CUSTOMER', 'ADMIN', 'DELIVERER', 'CASHIER')
    .messages({
      'any.only': 'Rol inválido.',
    }),

  isActive: Joi.boolean()
}).min(1).messages({
  'object.min': 'Debes enviar al menos un campo para actualizar.',
});

// USER QUERY SCHEMA
export const userQuerySchema = Joi.object({
  role: Joi.string()
    .valid('CUSTOMER', 'ADMIN', 'DELIVERER', 'CASHIER', 'ALL')
    .default('ALL'),
    
  search: Joi.string().trim().max(100).optional(),
  
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(1000).default(50),
});
