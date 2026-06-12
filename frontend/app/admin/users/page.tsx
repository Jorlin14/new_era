/**
 * Admin Users Page - New Era Supermercado
 * 
 * Gestión de usuarios sincronizada con el backend:
 * - Listar todos los usuarios
 * - Filtrar por rol (Clientes, Cajeros, Domiciliarios, Admin)
 * - Editar datos del usuario y rol
 * - Activar/desactivar usuario
 * - Eliminar usuario
 * - Búsqueda en tiempo real
 * 
 * @module app/admin/users/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice } from '@/lib/format';
import { getAllUsersAdmin, updateUserAdmin, deleteUserAdmin } from '@/lib/api-admin';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getAllUsersAdmin({
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        search: searchQuery || undefined,
        limit: 1000,
      });
      setUsers(data);
    } catch (error: any) {
      alert(error.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, searchQuery]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [loadUsers]);

  const handleToggleActive = async (user: User) => {
    try {
      await updateUserAdmin(user.id, { isActive: !user.isActive });
      loadUsers();
    } catch (error: any) {
      alert(error.message || 'Error al cambiar estado del usuario');
    }
  };

  const filteredUsers = users.filter((user) => {
    if (statusFilter === 'active') return user.isActive;
    if (statusFilter === 'inactive') return !user.isActive;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Usuarios</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Gestiona los usuarios registrados en tu tienda
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex flex-col gap-4">
        
        {/* Role Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'CUSTOMER', label: 'Clientes' },
            { id: 'CASHIER', label: 'Cajeros' },
            { id: 'DELIVERER', label: 'Domiciliarios' },
            { id: 'ADMIN', label: 'Administradores' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`cursor-pointer px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
                roleFilter === tab.id
                  ? 'bg-[#1c6554] text-white border-b-2 border-[#0C447C]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="search"
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 border border-slate-300 dark:border-slate-600 text-sm focus:outline-none focus:border-[#1c6554] dark:focus:border-green-400 focus:ring-2 focus:ring-[#1c6554]/20 rounded-lg dark:bg-slate-800 dark:text-white"
            />
            <SearchIcon />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="cursor-pointer h-10 px-4 border border-slate-300 dark:border-slate-600 text-sm focus:outline-none focus:border-[#1c6554] rounded-lg dark:bg-slate-800 dark:text-white"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">
                  Pedidos
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1c6554]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1c6554] dark:bg-green-600 flex items-center justify-center text-white font-bold rounded-full">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Registrado: {new Date(user.createdAt).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <p>{user.email}</p>
                      <p className="text-slate-500 dark:text-slate-500">{user.phone || 'Sin teléfono'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                      {user.totalOrders}
                      <p className="text-xs text-slate-500 font-normal">{formatPrice(user.totalSpent)}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`cursor-pointer px-3 py-1 text-xs font-medium rounded-full ${
                          user.isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        }`}
                      >
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="cursor-pointer text-sm font-medium text-[#1c6554] dark:text-green-400 hover:text-[#1c6554]/80 dark:hover:text-green-300 transition-colors"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onRefresh={() => {
            loadUsers();
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    CUSTOMER: 'bg-blue-100 text-blue-800 border-blue-200',
    CASHIER: 'bg-amber-100 text-amber-800 border-amber-200',
    DELIVERER: 'bg-teal-100 text-teal-800 border-teal-200',
  };

  const labels: Record<string, string> = {
    ADMIN: 'Admin',
    CUSTOMER: 'Cliente',
    CASHIER: 'Cajero',
    DELIVERER: 'Domiciliario',
  };

  return (
    <span className={`px-2 py-1 text-xs font-bold rounded-md border ${styles[role] || styles.CUSTOMER}`}>
      {labels[role] || role}
    </span>
  );
}
interface UserDetailModalProps {
  user: User;
  onClose: () => void;
  onRefresh: () => void;
}

function UserDetailModal({ user, onClose, onRefresh }: UserDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    name: user.name, 
    phone: user.phone || '', 
    role: user.role,
    password: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const dataToUpdate: any = { ...formData };
      if (!dataToUpdate.password || dataToUpdate.password.trim() === '') {
        delete dataToUpdate.password;
      }
      await updateUserAdmin(user.id, dataToUpdate);
      onRefresh();
    } catch (error: any) {
      alert(error.message || 'Error al actualizar usuario');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Si tiene pedidos, solo se desactivará su cuenta.')) return;
    try {
      setIsDeleting(true);
      const res = await deleteUserAdmin(user.id);
      alert(res.message);
      onRefresh();
    } catch (error: any) {
      alert(error.message || 'Error al eliminar usuario');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-xl">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Detalles del Usuario
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">ID: {user.id}</p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-full"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Pedidos</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{user.totalOrders}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Gastado</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(user.totalSpent)}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Estado de Cuenta</p>
                  <p className={`text-2xl font-bold ${user.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Datos Personales</h4>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="cursor-pointer text-sm font-semibold px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      Editar Información
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setFormData({ name: user.name, phone: user.phone || '', role: user.role });
                          setIsEditing(false);
                        }}
                        className="cursor-pointer text-sm font-medium px-4 py-2 hover:bg-slate-200 rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="cursor-pointer text-sm font-semibold px-4 py-2 bg-[#1c6554] text-white rounded-lg hover:bg-[#0C447C] transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 disabled:text-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email (No editable)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 text-slate-500 dark:bg-slate-800/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 disabled:text-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Rol de Usuario
                    </label>
                    <select
                      disabled={!isEditing}
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 disabled:text-slate-600 dark:bg-slate-800 dark:text-white cursor-pointer"
                    >
                      <option value="CUSTOMER">Cliente</option>
                      <option value="CASHIER">Cajero</option>
                      <option value="DELIVERER">Domiciliario</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nueva Contraseña (Opcional)
                    </label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      placeholder="Dejar en blanco para no cambiar"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-600 disabled:bg-slate-100 disabled:text-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              
              {/* Danger Zone */}
              <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-6 rounded-xl mt-8">
                <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">Zona de Peligro</h4>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                  Eliminar este usuario del sistema. Si el usuario ya ha realizado compras o operaciones, el sistema realizará una "eliminación suave" y simplemente lo desactivará permanentemente para proteger la integridad contable.
                </p>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar Usuario'}
                </button>
              </div>

            </div>
        </div>
      </div>
    </div>
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

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
