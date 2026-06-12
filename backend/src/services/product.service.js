/**
 * Product Service — New Era Supermercado
 *
 * Lógica de negocio para categorías y productos del catálogo.
 *
 * @module services/product
 */

import prisma from '../config/database.js';
import { AppError } from '../middlewares/error.middleware.js';
import { deleteImage } from '../config/upload.js';

// SERIALIZE DECIMAL
const serializeProduct = (product) => ({
  ...product,
  price: parseFloat(product.price),
});

// ── CATEGORIES ──

// GET ALL CATEGORIES
export const getAllCategories = async ({ page, limit }) => {
  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    }),
    prisma.category.count(),
  ]);

  return {
    data: categories,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// CREATE CATEGORY
export const createCategory = async ({ name }) => {
  return prisma.category.create({ data: { name } });
};

// UPDATE CATEGORY
export const updateCategory = async (id, data) => {
  await findCategoryOrFail(id);
  return prisma.category.update({ where: { id }, data });
};

// DELETE CATEGORY
export const deleteCategory = async (id) => {
  await findCategoryOrFail(id);

  const productCount = await prisma.product.count({ where: { categoryId: id } });

  if (productCount > 0) {
    throw new AppError(
      `No se puede eliminar: la categoría tiene ${productCount} producto(s) asociado(s). Reasignalos primero.`,
      409
    );
  }

  await prisma.category.delete({ where: { id } });
  return { message: 'Categoría eliminada correctamente.' };
};

// FIND CATEGORY OR FAIL
const findCategoryOrFail = async (id) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError('Categoría no encontrada.', 404);
  return category;
};

// ── PRODUCTS ──

// GET ALL PRODUCTS
export const getAllProducts = async ({ search, categoryId, onlyActive, page, limit, sortBy, order }) => {
  const where = {
    ...(onlyActive && { isActive: true }),
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
    ...(categoryId && { categoryId }),
  };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products.map(serializeProduct),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// GET PRODUCT BY ID
export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true } } },
  });

  if (!product) throw new AppError('Producto no encontrado.', 404);
  return serializeProduct(product);
};

// CREATE PRODUCT
export const createProduct = async (data) => {
  await findCategoryOrFail(data.categoryId);

  const product = await prisma.product.create({
    data,
    include: { category: { select: { id: true, name: true } } },
  });

  return serializeProduct(product);
};

// UPDATE PRODUCT
export const updateProduct = async (id, data) => {
  const existingProduct = await findProductOrFail(id);

  if (data.categoryId) {
    await findCategoryOrFail(data.categoryId);
  }

  // Si hay una nueva imagen y existía una anterior, eliminar la anterior
  if (data.imageUrl && existingProduct.imageUrl && data.imageUrl !== existingProduct.imageUrl) {
    deleteImage(existingProduct.imageUrl);
  }

  const updated = await prisma.product.update({
    where: { id },
    data,
    include: { category: { select: { id: true, name: true } } },
  });

  return serializeProduct(updated);
};

// SOFT DELETE PRODUCT
export const deleteProduct = async (id) => {
  const product = await findProductOrFail(id);

  // Eliminar imagen si existe
  if (product.imageUrl) {
    deleteImage(product.imageUrl);
  }

  const deactivated = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    select: { id: true, name: true, isActive: true },
  });

  return { message: 'Producto desactivado correctamente.', product: deactivated };
};

// FIND PRODUCT OR FAIL
const findProductOrFail = async (id) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError('Producto no encontrado.', 404);
  return product;
};