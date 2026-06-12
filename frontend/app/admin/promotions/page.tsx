/**
 * Admin Promotions Page - New Era Supermercado
 * 
 * Gestión completa de promociones y popups:
 * - Listar todas las promociones
 * - Crear nueva promoción
 * - Editar promoción existente
 * - Eliminar promoción
 * - Activar/desactivar promoción
 * - Configurar fechas y prioridad
 * 
 * @module app/admin/promotions/page
 */

'use client';

import { useState, useEffect } from 'react';
import { getPromotions } from '@/lib/api';
import { getImageUrl } from '@/lib/constants';
import {
  createPromotion,
  updatePromotion,
  deletePromotion,
  uploadProductImage,
} from '@/lib/api-admin';
import ImageUpload from '@/components/admin/ImageUpload';
import type { Promotion } from '@/lib/types';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPromotions();
  }, []);

  async function loadPromotions() {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await getPromotions({ limit: 50 });
      setPromotions(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar promociones');
      console.error('Error loading promotions:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddPromotion = () => {
    setEditingPromotion(null);
    setIsModalOpen(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (promotionId: string) => {
    try {
      const promotion = promotions.find((p) => p.id === promotionId);
      if (!promotion) return;

      await updatePromotion(promotionId, { isActive: !promotion.isActive });
      
      setPromotions((prev) =>
        prev.map((p) =>
          p.id === promotionId ? { ...p, isActive: !p.isActive } : p
        )
      );
    } catch (err: any) {
      alert('Error al cambiar estado: ' + err.message);
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta promoción?')) return;

    try {
      await deletePromotion(promotionId);
      setPromotions((prev) => prev.filter((p) => p.id !== promotionId));
    } catch (err: any) {
      alert('Error al eliminar promoción: ' + err.message);
    }
  };

  const handleSavePromotion = async (promotionData: any) => {
    try {
      if (editingPromotion) {
        const updated = await updatePromotion(editingPromotion.id, promotionData);
        setPromotions((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        const newPromotion = await createPromotion(promotionData);
        setPromotions((prev) => [newPromotion, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Error al guardar promoción: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c6554] dark:border-green-400 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Cargando promociones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
        <p className="text-red-800 dark:text-red-300">Error: {error}</p>
        <button
          onClick={loadPromotions}
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Promociones y Popups</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gestiona las promociones que se muestran a los clientes
          </p>
        </div>
        <button
          onClick={handleAddPromotion}
          className="px-4 py-2 bg-[#1c6554] hover:bg-[#1c6554]/90 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium transition-colors flex items-center gap-2"
        >
          <PlusIcon />
          Nueva Promoción
        </button>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promotion) => (
          <div
            key={promotion.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image */}
            <div className="h-48 bg-slate-100 dark:bg-slate-800 relative">
              {promotion.imageUrl ? (
                <img
                  src={getImageUrl(promotion.imageUrl) || ''}
                  alt={promotion.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load promotion image:', promotion.imageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon />
                </div>
              )}
              {/* Priority Badge */}
              {promotion.priority > 0 && (
                <div className="absolute top-2 right-2 bg-amber-500 dark:bg-amber-600 text-white px-2 py-1 text-xs font-bold rounded">
                  Prioridad: {promotion.priority}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1">
                {promotion.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                {promotion.description}
              </p>

              {/* Dates */}
              <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <CalendarIcon />
                  <span>Inicio: {formatDate(promotion.startDate)}</span>
                </div>
                {promotion.endDate && (
                  <div className="flex items-center gap-1">
                    <CalendarIcon />
                    <span>Fin: {formatDate(promotion.endDate)}</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(promotion.id)}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    promotion.isActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
                  }`}
                >
                  {promotion.isActive ? 'Activa' : 'Inactiva'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditPromotion(promotion)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-[#1c6554] dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded"
                    title="Editar"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDeletePromotion(promotion.id)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded"
                    title="Eliminar"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {promotions.length === 0 && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-600">
            <ImageIcon />
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">No hay promociones creadas</p>
          <button
            onClick={handleAddPromotion}
            className="px-4 py-2 bg-[#1c6554] hover:bg-[#1c6554]/90 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium transition-colors"
          >
            Crear primera promoción
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <PromotionModal
          promotion={editingPromotion}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePromotion}
        />
      )}
    </div>
  );
}
interface PromotionModalProps {
  promotion: Promotion | null;
  onClose: () => void;
  onSave: (promotion: any) => void;
}

function PromotionModal({ promotion, onClose, onSave }: PromotionModalProps) {
  const [formData, setFormData] = useState({
    title: promotion?.title || '',
    description: promotion?.description || '',
    imageUrl: promotion?.imageUrl || '',
    ctaText: promotion?.ctaText || 'Ver más',
    ctaLink: promotion?.ctaLink || '',
    startDate: promotion?.startDate ? promotion.startDate.split('T')[0] : '',
    endDate: promotion?.endDate ? promotion.endDate.split('T')[0] : '',
    priority: promotion?.priority?.toString() || '0',
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data: any = {
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl || null,
      ctaText: formData.ctaText,
      ctaLink: formData.ctaLink || null,
      priority: Number(formData.priority),
    };

    if (formData.startDate) {
      data.startDate = new Date(formData.startDate).toISOString();
    }
    if (formData.endDate) {
      data.endDate = new Date(formData.endDate).toISOString();
    }

    onSave(data);
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData({ ...formData, imageUrl });
    setUploadError(null);
  };

  const handleImageError = (error: string) => {
    setUploadError(error);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {promotion ? 'Editar Promoción' : 'Nueva Promoción'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {uploadError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded">
              <p className="text-sm text-red-800 dark:text-red-300">{uploadError}</p>
            </div>
          )}

          <ImageUpload
            currentImage={formData.imageUrl}
            onImageUploaded={handleImageUploaded}
            onError={handleImageError}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Título *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full h-10 px-3 border border-slate-300 dark:border-slate-600 focus:outline-none focus:border-[#1c6554] dark:focus:border-green-400 focus:ring-2 focus:ring-[#1c6554]/20 dark:focus:ring-green-400/20"
              placeholder="Ej: Productos Frescos Diarios"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Descripción *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 focus:outline-none focus:border-[#1c6554] dark:focus:border-green-400 focus:ring-2 focus:ring-[#1c6554]/20 dark:focus:ring-green-400/20"
              placeholder="Describe la promoción..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Texto del botón
              </label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className="w-full h-10 px-3 border border-slate-300 dark:border-slate-600 focus:outline-none focus:border-[#1c6554] dark:focus:border-green-400 focus:ring-2 focus:ring-[#1c6554]/20 dark:focus:ring-green-400/20"
                placeholder="Ver más"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Enlace del botón
              </label>
              <input
                type="text"
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                className="w-full h-10 px-3 border border-slate-300 dark:border-slate-600 focus:outline-none focus:border-[#1c6554] dark:focus:border-green-400 focus:ring-2 focus:ring-[#1c6554]/20 dark:focus:ring-green-400/20"
                placeholder="/productos"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Fecha inicio
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full h-10 px-3 border border-slate-300 dark:border-slate-600 focus:outline-none focus:border-[#1c6554] dark:focus:border-green-400 focus:ring-2 focus:ring-[#1c6554]/20 dark:focus:ring-green-400/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Fecha fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full h-10 px-3 border border-slate-300 dark:border-slate-600 focus:outline-none focus:border-[#1c6554] dark:focus:border-green-400 focus:ring-2 focus:ring-[#1c6554]/20 dark:focus:ring-green-400/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Prioridad (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full h-10 px-3 border border-slate-300 dark:border-slate-600 focus:outline-none focus:border-[#1c6554] dark:focus:border-green-400 focus:ring-2 focus:ring-[#1c6554]/20 dark:focus:ring-green-400/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
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
              className="px-4 py-2 bg-[#1c6554] hover:bg-[#1c6554]/90 dark:bg-green-600 dark:hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : (promotion ? 'Guardar Cambios' : 'Crear Promoción')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Sin fecha';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg className="w-full h-full text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
