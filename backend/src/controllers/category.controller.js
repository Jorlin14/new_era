/**
 * Category Controller — New Era Supermercado
 *
 * CRUD de categorías de productos.
 * La lógica de negocio vive en product.service.js (comparte dominio catálogo).
 *
 * @module controllers/category
 */

import * as productService from '../services/product.service.js';

/** GET /api/categories — Listar categorías */
export const getAllCategories = async (req, res, next) => {
  try {
    const result = await productService.getAllCategories(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/** POST /api/categories — Crear categoría (ADMIN) */
export const createCategory = async (req, res, next) => {
  try {
    const category = await productService.createCategory(req.body);

    res.status(201).json({
      success: true,
      message: 'Categoría creada correctamente.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/categories/:id — Actualizar categoría (ADMIN) */
export const updateCategory = async (req, res, next) => {
  try {
    const category = await productService.updateCategory(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Categoría actualizada correctamente.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/categories/:id — Eliminar categoría sin productos (ADMIN) */
export const deleteCategory = async (req, res, next) => {
  try {
    const result = await productService.deleteCategory(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
