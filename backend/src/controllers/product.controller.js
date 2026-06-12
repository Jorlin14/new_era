/**
 * Product Controller — New Era Supermercado
 *
 * CRUD de productos del catálogo.
 *
 * @module controllers/product
 */

import * as productService from '../services/product.service.js';

/** GET /api/products — Listar productos con filtros */
export const getAllProducts = async (req, res, next) => {
  try {
    const result = await productService.getAllProducts(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/** GET /api/products/:id — Obtener un producto */
export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/** POST /api/products — Crear producto (ADMIN) */
export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      message: 'Producto creado correctamente.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/** PATCH /api/products/:id — Actualizar producto (ADMIN) */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Producto actualizado correctamente.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/products/:id — Desactivar producto, soft delete (ADMIN) */
export const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
