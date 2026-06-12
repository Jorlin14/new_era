/**
 * Error Middleware — New Era Supermercado
 *
 * Manejo centralizado de errores de la API.
 *
 * @module middlewares/error
 */

/** Captura errores y devuelve respuesta JSON consistente */
export const errorHandler = (err, req, res, next) => {
  // Violación de restricción única en Prisma
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'campo';
    return res.status(409).json({
      success: false,
      message: `Ya existe un registro con ese ${field}.`,
    });
  }

  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message: err.message || 'Error interno del servidor.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  console.error(`[ERROR] ${req.method} ${req.path} → ${statusCode}: ${err.message}`);
  res.status(statusCode).json(response);
};

/** Error de aplicación con código HTTP explícito */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}
