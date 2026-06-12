import Joi from 'joi';

// PASSWORD SCHEMA
const passwordSchema = Joi.string()
  .min(8)
  .max(72)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'password seguro')
  .required()
  .messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres.',
    'string.max': 'La contraseña no puede superar los 72 caracteres.',
    'string.pattern.name': 'La contraseña debe tener al menos una mayúscula, una minúscula y un número.',
    'any.required': 'La contraseña es obligatoria.',
  });

// REGISTER SCHEMA
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres.',
      'string.max': 'El nombre no puede superar los 100 caracteres.',
      'any.required': 'El nombre es obligatorio.',
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'El email no tiene un formato válido.',
      'any.required': 'El email es obligatorio.',
    }),

  password: passwordSchema,

  phone: Joi.string()
    .pattern(/^\+?[\d\s\-()]{7,20}$/)
    .optional()
    .messages({
      'string.pattern.base': 'El teléfono no tiene un formato válido.',
    }),
});

// LOGIN SCHEMA
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'El email no tiene un formato válido.',
      'any.required': 'El email es obligatorio.',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña es obligatoria.',
    }),
});


// FORGOT PASSWORD SCHEMA
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'El email no tiene un formato válido.',
      'any.required': 'El email es obligatorio.',
    }),
});

// RESET PASSWORD SCHEMA
export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .min(32)
    .required()
    .messages({
      'string.min': 'El token no es válido.',
      'any.required': 'El token es obligatorio.',
      'string.empty': 'El token no puede estar vacío.',
    }),

  password: passwordSchema,
});

// UPDATE PROFILE SCHEMA
export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres.',
      'string.max': 'El nombre no puede superar los 100 caracteres.',
      'any.required': 'El nombre es obligatorio.',
    }),

  phone: Joi.string()
    .pattern(/^\+?[\d\s\-()]{7,20}$/)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'El teléfono no tiene un formato válido.',
    }),
});

// UPDATE PASSWORD SCHEMA
export const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña actual es obligatoria.',
    }),

  newPassword: passwordSchema,
});
