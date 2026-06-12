/**
 * My Addresses Page - New Era Supermercado
 * 
 * Página donde el cliente puede gestionar sus direcciones de entrega.
 * Permite crear, editar, eliminar y establecer dirección por defecto.
 * 
 * @module app/my-addresses/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from '@/lib/api-customer';
import { getCurrentUser } from '@/lib/api-admin';
import Toast from '@/components/Toast';

interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  neighborhood: string;
  details?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
}

export default function MyAddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    loadAddresses();
  }, [router]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await getMyAddresses();
      setAddresses(data);
    } catch (error: any) {
      console.error('Error al cargar direcciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      loadAddresses();
      setToastMessage({ text: 'Dirección por defecto actualizada', type: 'success' });
    } catch (error: any) {
      setToastMessage({ text: error.message || 'Error al establecer dirección por defecto', type: 'error' });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAddress(id);
      setConfirmingDeleteId(null);
      await loadAddresses();
    } catch (error: any) {
      setDeleteError(error.message || 'Error al eliminar dirección');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveAddress = async (data: any) => {
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, data);
      } else {
        await createAddress(data);
      }
      setIsModalOpen(false);
      loadAddresses();
      setToastMessage({ text: 'Dirección guardada exitosamente', type: 'success' });
    } catch (error: any) {
      setToastMessage({ text: error.message || 'Error al guardar dirección', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8">
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-[#1c6554] dark:hover:text-green-400 mb-4 transition-colors"
          >
            <BackIcon />
            Volver a la tienda
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Mis Direcciones
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Gestiona tus direcciones de entrega
              </p>
            </div>
            <button
              onClick={handleAddAddress}
              className="px-6 py-3 bg-gradient-to-r from-[#1c6554] to-[#0C447C] dark:from-green-600 dark:to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusIcon />
              Nueva Dirección
            </button>
          </div>
        </div>

        {/* Addresses Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1c6554] dark:border-green-400"></div>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center shadow-sm">
            <LocationIcon className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-300 text-lg font-medium mb-2">
              No tienes direcciones guardadas
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Agrega una dirección para facilitar tus pedidos
            </p>
            <button
              onClick={handleAddAddress}
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#1c6554] to-[#0C447C] dark:from-green-600 dark:to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all cursor-pointer"
            >
              Agregar primera dirección
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white dark:bg-slate-900 border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 relative ${
                  address.isDefault
                    ? 'border-[#1c6554] dark:border-green-500'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Default badge */}
                {address.isDefault && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-[#1c6554] dark:bg-green-600 text-white text-xs font-bold rounded-full">
                    Por defecto
                  </div>
                )}

                {/* Label */}
                {address.label && (
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg">
                      {address.label}
                    </span>
                  </div>
                )}

                {/* Address details */}
                <div className="space-y-2 mb-4 mt-2">
                  <p className="text-slate-900 dark:text-white font-medium">{address.address}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Barrio: {address.neighborhood}
                  </p>
                  {address.details && (
                    <p className="text-slate-500 dark:text-slate-500 text-xs italic">
                      {address.details}
                    </p>
                  )}
                </div>

                {/* Confirmación de eliminación */}
                {confirmingDeleteId === address.id ? (
                  <div className="pt-4 border-t border-red-200 dark:border-red-900/50">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-3">
                      ¿Eliminar esta dirección?
                    </p>
                    {deleteError && (
                      <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mb-3">
                        {deleteError}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        disabled={deleting}
                        className="flex-1 px-3 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                      </button>
                      <button
                        onClick={() => { setConfirmingDeleteId(null); setDeleteError(null); }}
                        disabled={deleting}
                        className="flex-1 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Actions */
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-[#1c6554] dark:text-green-400 hover:bg-[#1c6554]/10 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      >
                        Hacer principal
                      </button>
                    )}
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="p-2 text-slate-600 dark:text-slate-400 hover:text-[#1c6554] dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <EditIcon />
                    </button>
                    {address.isDefault && addresses.length > 1 ? (
                      <span
                        className="p-2 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                        title="Establece otra dirección como principal antes de eliminar esta"
                      >
                        <TrashIcon />
                      </span>
                    ) : (
                      <button
                        onClick={() => { setConfirmingDeleteId(address.id); setDeleteError(null); }}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <AddressModal
            address={editingAddress}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveAddress}
          />
        )}
      </div>
    </div>
  );
}
interface AddressModalProps {
  address: Address | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

function AddressModal({ address, onClose, onSave }: AddressModalProps) {
  const [formData, setFormData] = useState({
    label: address?.label || '',
    address: address?.address || '',
    neighborhood: address?.neighborhood || '',
    details: address?.details || '',
    isDefault: address?.isDefault || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="sticky top-0 bg-gradient-to-r from-[#1c6554] to-[#0C447C] dark:from-green-600 dark:to-blue-600 text-white px-6 py-5 rounded-t-2xl flex justify-between items-start">
          <h3 className="text-2xl font-bold">
            {address ? 'Editar Dirección' : 'Nueva Dirección'}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Etiqueta *
            </label>
            <input
              type="text"
              required
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#1c6554] dark:focus:border-green-500 focus:ring-4 focus:ring-[#1c6554]/10 dark:focus:ring-green-500/20 transition-all text-slate-900 dark:text-white"
              placeholder="Ej: Casa, Oficina, Apartamento..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Dirección completa *
            </label>
            <input
              type="text"
              required
              pattern=".*#.*"
              title="Debes incluir nomenclatura completa (Ej: Calle 14 # 2-30)"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#1c6554] dark:focus:border-green-500 focus:ring-4 focus:ring-[#1c6554]/10 dark:focus:ring-green-500/20 transition-all text-slate-900 dark:text-white"
              placeholder="Ej: Calle 14 # 2-30"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Barrio *
            </label>
            <input
              type="text"
              required
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#1c6554] dark:focus:border-green-500 focus:ring-4 focus:ring-[#1c6554]/10 dark:focus:ring-green-500/20 transition-all text-slate-900 dark:text-white"
              placeholder="Ej: La Pola"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Indicaciones / Detalles (Opcional)
            </label>
            <input
              type="text"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#1c6554] dark:focus:border-green-500 focus:ring-4 focus:ring-[#1c6554]/10 dark:focus:ring-green-500/20 transition-all text-slate-900 dark:text-white"
              placeholder="Ej: Casa de rejas negras, frente a la tienda..."
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-5 h-5 accent-[#1c6554] dark:accent-green-500 cursor-pointer rounded"
            />
            <label
              htmlFor="isDefault"
              className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer font-medium"
            >
              Establecer como dirección principal
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#1c6554] to-[#0C447C] dark:from-green-600 dark:to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              {address ? 'Guardar Cambios' : 'Crear Dirección'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function BackIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
