import Joi from 'joi';
const addressFields = {
  label: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .messages({
      'string.min': 'La etiqueta debe tener al menos 2 caracteres.',
      'string.max': 'La etiqueta no puede superar los 50 caracteres.',
    }),

  address: Joi.string()
    .min(5)
    .max(200)
    .pattern(/#/)
    .trim()
    .messages({
      'string.min': 'La dirección debe tener al menos 5 caracteres.',
      'string.max': 'La dirección no puede superar los 200 caracteres.',
      'string.pattern.base': 'La dirección debe incluir nomenclatura completa con el símbolo # (ej: Calle 10 # 5-20).',
    }),

  neighborhood: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.min': 'El barrio debe tener al menos 2 caracteres.',
      'string.max': 'El barrio no puede superar los 100 caracteres.',
    }),

  details: Joi.string()
    .max(200)
    .trim()
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'Las indicaciones no pueden superar los 200 caracteres.',
    }),

  latitude: Joi.number()
    .min(-90)
    .max(90)
    .optional()
    .messages({
      'number.min': 'La latitud debe estar entre -90 y 90.',
      'number.max': 'La latitud debe estar entre -90 y 90.',
    }),

  longitude: Joi.number()
    .min(-180)
    .max(180)
    .optional()
    .messages({
      'number.min': 'La longitud debe estar entre -180 y 180.',
      'number.max': 'La longitud debe estar entre -180 y 180.',
    }),

  isDefault: Joi.boolean().optional(),
};

// CREATE ADDRESS SCHEMA
export const createAddressSchema = Joi.object({
  label: addressFields.label.required().messages({
    'any.required': 'La etiqueta es obligatoria (ej: "Casa", "Trabajo").',
  }),
  address: addressFields.address.required().messages({
    'any.required': 'La dirección es obligatoria.',
  }),
  neighborhood: addressFields.neighborhood.required().messages({
    'any.required': 'El barrio es obligatorio.',
  }),
  details: addressFields.details,
  latitude:  addressFields.latitude,
  longitude: addressFields.longitude,
  isDefault: addressFields.isDefault,
}).and('latitude', 'longitude').messages({
  'object.and': 'Si enviás coordenadas, debés enviar tanto latitud como longitud.',
});

// UPDATE ADDRESS SCHEMA (PARTIAL)
export const updateAddressSchema = Joi.object({
  label:     addressFields.label,
  address:   addressFields.address,
  neighborhood: addressFields.neighborhood,
  details:   addressFields.details,
  latitude:  addressFields.latitude,
  longitude: addressFields.longitude,
  isDefault: addressFields.isDefault,
}).min(1).and('latitude', 'longitude').messages({
  'object.min': 'Debés enviar al menos un campo para actualizar.',
  'object.and': 'Si enviás coordenadas, debés enviar tanto latitud como longitud.',
});