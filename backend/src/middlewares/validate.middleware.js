/**
 * Validate Middleware — New Era Supermercado
 *
 * Valida body, query o params con esquemas Joi antes de llegar al controlador.
 *
 * @module middlewares/validate
 */

/**
 * @param {import('joi').ObjectSchema} schema - Esquema Joi
 * @param {'body'|'query'|'params'} source - Fuente de datos a validar
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación.',
      errors: messages,
    });
  }

  req[source] = value;
  next();
};
