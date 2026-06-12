/**
 * My Profile Page - New Era Supermercado
 * 
 * Página donde el cliente puede ver y editar su información personal.
 * Permite actualizar nombre, email, teléfono y contraseña.
 * 
 * @module app/my-profile/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout, changePassword, updateProfile } from '@/lib/api-admin';
import Toast from '@/components/Toast';

export default function MyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    setUser(currentUser);
    setProfileData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
    });
    setLoading(false);
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
      });

      // Actualizar localStorage y estado
      if (res.data?.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
      
      setToast({ message: res.message || 'Perfil actualizado correctamente', type: 'success' });
      setIsEditing(false);
    } catch (error: any) {
      setToast({ message: error.message || 'Error al actualizar el perfil', type: 'error' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({ message: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setToast({ message: 'La contraseña debe tener al menos 8 caracteres', type: 'error' });
      return;
    }

    // Validar requisitos de contraseña
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumber = /\d/.test(passwordData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setToast({ message: 'La contraseña debe tener al menos una mayúscula, una minúscula y un número', type: 'error' });
      return;
    }

    try {
      const res = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setToast({ message: res.message || 'Contraseña actualizada correctamente.', type: 'success' });
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setToast({ message: error.message || 'Error al cambiar la contraseña', type: 'error' });
    }
  };

  const handleLogoutConfirm = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1c6554] dark:border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-[#1c6554] dark:hover:text-green-400 mb-4 transition-colors"
          >
            <BackIcon />
            Volver a la tienda
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mi Perfil</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Administra tu información personal y configuración de cuenta
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Info Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#1c6554] to-[#0C447C] dark:from-green-600 dark:to-blue-600 px-6 py-8 text-white">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-white/90">{user?.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur text-sm font-semibold rounded-full">
                    {user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'DELIVERER' ? 'Domiciliario' : user?.role === 'CASHIER' ? 'Cajero' : 'Cliente'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Información Personal
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer px-4 py-2 text-sm font-semibold text-[#1c6554] dark:text-green-400 hover:bg-[#1c6554]/10 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="cursor-pointer px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Usuario
                    </label>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#1c6554] dark:focus:border-green-500 focus:ring-4 focus:ring-[#1c6554]/10 dark:focus:ring-green-500/20 transition-all text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={profileData.email}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                      title="El correo electrónico no puede modificarse por el momento"
                    />
                    <p className="text-xs text-slate-500 mt-1">El cambio de correo estará disponible en futuras actualizaciones.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#1c6554] dark:focus:border-green-500 focus:ring-4 focus:ring-[#1c6554]/10 dark:focus:ring-green-500/20 transition-all text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="cursor-pointer w-full px-4 py-3 bg-gradient-to-r from-[#1c6554] to-[#0C447C] dark:from-green-600 dark:to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Guardar Cambios
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Nombre
                    </label>
                    <p className="text-lg text-slate-900 dark:text-white font-medium">
                      {user?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Email
                    </label>
                    <p className="text-lg text-slate-900 dark:text-white font-medium">
                      {user?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Teléfono
                    </label>
                    <p className="text-lg text-slate-900 dark:text-white font-medium">
                      {user?.phone || 'No especificado'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Seguridad
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Cambia tu contraseña regularmente para mantener tu cuenta segura
                </p>
              </div>
            </div>

            {!isChangingPassword ? (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="cursor-pointer px-4 py-2 text-sm font-semibold text-[#1c6554] dark:text-green-400 hover:bg-[#1c6554]/10 dark:hover:bg-green-900/20 rounded-lg transition-colors flex items-center gap-2"
              >
                <LockIcon />
                Cambiar Contraseña
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#1c6554] dark:focus:border-green-500 focus:ring-4 focus:ring-[#1c6554]/10 dark:focus:ring-green-500/20 transition-all text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#1c6554] dark:focus:border-green-500 focus:ring-4 focus:ring-[#1c6554]/10 dark:focus:ring-green-500/20 transition-all text-slate-900 dark:text-white"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Mínimo 8 caracteres, una mayúscula, una minúscula y un número
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl focus:border-[#1c6554] dark:focus:border-green-500 focus:ring-4 focus:ring-[#1c6554]/10 dark:focus:ring-green-500/20 transition-all text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    className="cursor-pointer flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer flex-1 px-4 py-3 bg-gradient-to-r from-[#1c6554] to-[#0C447C] dark:from-green-600 dark:to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Actualizar Contraseña
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Logout Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Cerrar Sesión
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Cierra tu sesión en este dispositivo de forma segura.
            </p>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="cursor-pointer px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <LogoutIcon />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 animate-fade-in p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogoutIcon className="w-8 h-8 text-rose-500 dark:text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                ¿Cerrar sesión?
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                ¿Estás seguro de que deseas salir de tu cuenta?
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="cursor-pointer flex-1 px-4 py-2.5 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="cursor-pointer flex-1 px-4 py-2.5 bg-rose-500 text-white font-semibold hover:bg-rose-600 rounded-xl transition-colors shadow-lg shadow-rose-500/20"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
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

function LockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function LogoutIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}
