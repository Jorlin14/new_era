/**
 * Admin Products Page - New Era Supermercado
 * 
 * Gestión completa de productos:
 * - Listar todos los productos
 * - Agregar nuevo producto
 * - Editar producto existente
 * - Eliminar producto
 * - Marcar como destacado
 * - Activar/desactivar producto
 * - Búsqueda y filtros
 * 
 * @module app/admin/products/page
 */

'use client';

import { useState, useEffect } from 'react';
import { getCategories } from '@/lib/api';
import { 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getAllProductsAdmin
} from '@/lib/api-admin';
import type { Product, Category } from '@/lib/types';
import ImageUpload from '@/components/admin/ImageUpload';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      setError(null);
      const [productsData, categoriesData] = await Promise.all([
        getAllProductsAdmin(),
        getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Filtrar productos por búsqueda y dropdowns
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'active' 
        ? product.isActive 
        : !product.isActive;
        
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleToggleFeatured = (productId: string) => {
    // TODO: Implementar campo "featured" en el backend
    console.log('Toggle featured:', productId);
  };

  const handleToggleActive = async (productId: string) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      await updateProduct(productId, { isActive: !product.isActive });
      
      // Actualizar estado local
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, isActive: !p.isActive } : p
        )
      );
    } catch (err: any) {
      alert('Error al cambiar estado: ' + err.message);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: any) {
      alert('Error al eliminar producto: ' + err.message);
    }
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      if (editingProduct) {
        // Editar producto existente
        const updated = await updateProduct(editingProduct.id, {
          name: productData.name,
          description: productData.description || null,
          price: Number(productData.price),
          stock: Number(productData.stock),
          categoryId: productData.categoryId,
          imageUrl: productData.imageUrl || null,
        });
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        // Crear nuevo producto
        const newProduct = await createProduct({
          name: productData.name,
          description: productData.description || null,
          price: Number(productData.price),
          stock: Number(productData.stock),
          categoryId: productData.categoryId,
          imageUrl: productData.imageUrl || null,
          isActive: true,
        });
        setProducts((prev) => [newProduct, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Error al guardar producto: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c6554] mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-4">
        <p className="text-red-800 dark:text-red-300">Error: {error}</p>
        <button
          onClick={loadData}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Productos</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gestiona el catálogo de productos de tu tienda
          </p>
        </div>
        <button
          onClick={handleAddProduct}
          className="px-4 py-2 bg-[#1c6554] hover:bg-[#1c6554]/90 text-white font-medium transition-colors flex items-center gap-2"
        >
          <PlusIcon />
          Agregar Producto
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="search"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 border border-slate-300 text-sm focus:outline-none focus:border-[#1c6554] focus:ring-2 focus:ring-[#1c6554]/20"
            />
            <SearchIcon />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-4 border border-slate-300 text-sm focus:outline-none focus:border-[#1c6554]"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 border border-slate-300 text-sm focus:outline-none focus:border-[#1c6554]"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Destacado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {product.imageUrl && !imageErrors.has(product.id) ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={() => {
                              // Marcar imagen como fallida para mostrar ícono
                              setImageErrors(prev => new Set(prev).add(product.id));
                            }}
                          />
                        ) : (
                          <PackageIcon />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {product.category?.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium ${
                        product.stock > 50
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 20
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock} und
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleFeatured(product.id)}
                      className="text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      <StarIcon />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleActive(product.id)}
                      className={`px-3 py-1 text-xs font-medium ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-[#1c6554] dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Editar"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Eliminar"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para agregar/editar producto */}
      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}
interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (product: any) => void;
}

function ProductModal({ product, categories, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price.toString() || '',
    stock: product?.stock.toString() || '',
    categoryId: product?.categoryId || '',
    imageUrl: product?.imageUrl || '',
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSave(formData);
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData({ ...formData, imageUrl });
    setUploadError(null);
  };

  const handleImageError = (error: string) => {
    setUploadError(error);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {product ? 'Editar Producto' : 'Agregar Producto'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Alerta de error de imagen */}
          {uploadError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-3 rounded">
              <p className="text-sm text-red-800 dark:text-red-300">{uploadError}</p>
            </div>
          )}

          {/* Componente de subida de imagen */}
          <ImageUpload
            currentImage={formData.imageUrl}
            onImageUploaded={handleImageUploaded}
            onError={handleImageError}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nombre del producto *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-10 px-3 border border-slate-300 focus:outline-none focus:border-[#1c6554] focus:ring-2 focus:ring-[#1c6554]/20"
              placeholder="Ej: Leche Entera 1L"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 focus:outline-none focus:border-[#1c6554] focus:ring-2 focus:ring-[#1c6554]/20"
              placeholder="Descripción del producto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Precio (COP) *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full h-10 px-3 border border-slate-300 focus:outline-none focus:border-[#1c6554] focus:ring-2 focus:ring-[#1c6554]/20"
                placeholder="15000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Stock *
              </label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full h-10 px-3 border border-slate-300 focus:outline-none focus:border-[#1c6554] focus:ring-2 focus:ring-[#1c6554]/20"
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Categoría *
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full h-10 px-3 border border-slate-300 focus:outline-none focus:border-[#1c6554] focus:ring-2 focus:ring-[#1c6554]/20"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#1c6554] hover:bg-[#1c6554]/90 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Guardando...
                </span>
              ) : (
                product ? 'Guardar Cambios' : 'Agregar Producto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);
}
function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3 top-2.5 w-5 h-5 text-slate-400 pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
