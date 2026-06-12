/**
 * AnimatedAuth Component - New Era Supermercado
 * 
 * Componente de autenticación con formularios de login y registro animados.
 * Incluye validación de campos, manejo de errores y redirección según el rol del usuario.
 * 
 * Características:
 * - Alternancia animada entre login y registro
 * - Validación de contraseñas coincidentes en registro
 * - Almacenamiento automático del token JWT
 * - Redirección basada en rol (ADMIN → /admin/dashboard, USER → /)
 * - Estados de carga con spinners
 * - Manejo de errores con alertas al usuario
 * 
 * @module components/auth/AnimatedAuth
 */

'use client';

import { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import AuthField from '@/components/auth/AuthField';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import { login, register } from '@/lib/api-admin';

/** Tipo de modo de autenticación */
type AuthMode = 'login' | 'register';

/** Props del componente AnimatedAuth */
interface AnimatedAuthProps {
  /** Modo inicial (login o register) */
  initialMode?: AuthMode;
}

/** Duración de las animaciones en milisegundos */
const ANIMATION_MS = 500;

export default function AnimatedAuth({ initialMode = 'login' }: AnimatedAuthProps) {
  const router = useRouter();
  
  // Estados para controlar la UI y animaciones
  const [isSignUp, setIsSignUp] = useState(initialMode === 'register');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Datos del formulario de login
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // Datos del formulario de registro
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    phone: '',
    confirmPassword: ''
  });

  // Desactivar la animación inicial después del primer render
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialMount(false), 600);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Alterna entre modo login y registro con animación
   * 
   * @param {boolean} toSignUp - true para cambiar a registro, false para login
   */
  const switchMode = useCallback(
    (toSignUp: boolean) => {
      if (isAnimating || isSignUp === toSignUp) return;
      
      // Limpiar errores al cambiar de modo
      setError(null);
      setHasInteracted(true);
      setIsAnimating(true);
      setIsSignUp(toSignUp);
      
      // Esperar que termine la animación
      setTimeout(() => setIsAnimating(false), ANIMATION_MS);
    },
    [isAnimating, isSignUp]
  );

  /**
   * Maneja el submit del formulario de login
   * Conecta con el backend para autenticar al usuario
   * 
   * @param {React.FormEvent} event - Evento del formulario
   */
  async function handleLoginSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Llamada a la API de login
      const { user } = await login({
        email: loginData.email,
        password: loginData.password
      });

      // Redirección según el rol del usuario
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (user.role === 'DELIVERER') {
        router.push('/deliverer/dashboard');
      } else if (user.role === 'CASHIER') {
        router.push('/cashier/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      // Mostrar error al usuario
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      setIsLoading(false);
    }
  }

  /**
   * Maneja el submit del formulario de registro
   * Conecta con el backend para crear un nuevo usuario
   * 
   * @param {React.FormEvent} event - Evento del formulario
   */
  async function handleRegisterSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    // Validar que las contraseñas coincidan
    if (registerData.password !== registerData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud mínima de contraseña
    if (registerData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Validar que la contraseña tenga mayúscula, minúscula y número
    const hasUpperCase = /[A-Z]/.test(registerData.password);
    const hasLowerCase = /[a-z]/.test(registerData.password);
    const hasNumber = /\d/.test(registerData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError('La contraseña debe tener al menos una mayúscula, una minúscula y un número');
      return;
    }

    setIsLoading(true);

    try {
      // Llamada a la API de registro
      const { user } = await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone
      });

      // Redirección según el rol del usuario (generalmente CUSTOMER para nuevos registros)
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (user.role === 'DELIVERER') {
        router.push('/deliverer/dashboard');
      } else if (user.role === 'CASHIER') {
        router.push('/cashier/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      // Mostrar error al usuario
      setError(err.message || 'Error al crear la cuenta. Intenta con otro correo.');
      setIsLoading(false);
    }
  }

  const loginFormClass = getPanelAnimationClass('login-form', isSignUp, hasInteracted);
  const loginTextClass = getPanelAnimationClass('login-text', isSignUp, hasInteracted);
  const registerTextClass = getPanelAnimationClass('register-text', isSignUp, hasInteracted);
  const registerFormClass = getPanelAnimationClass('register-form', isSignUp, hasInteracted);

  return (
    <>
      {/* Logo - oculto en móvil, visible en desktop */}
      <div className={`hidden lg:block fixed z-[9999] transition-all duration-1000 ease-in-out hover:scale-110 pointer-events-auto ${
        isSignUp ? 'top-4 right-4' : 'bottom-4 left-4'
      }`} style={{
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
      }}>
        <Logo size="xl" />
      </div>

      {/* Botón volver al inicio - mejorado para móvil */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-[9999] flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white/95 hover:bg-white dark:bg-slate-900/95 dark:hover:bg-slate-900 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg sm:rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all hover:shadow-lg hover:scale-105 group pointer-events-auto"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-xs sm:text-sm font-semibold">Inicio</span>
      </Link>

      {/* Alerta de error global */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] max-w-md w-full mx-4 animate-slideDown pointer-events-auto">
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r-lg shadow-lg">
            <div className="flex items-start gap-3">
              {/* Icono de error */}
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">Error</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
              {/* Botón cerrar */}
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 dark:text-red-300 dark:hover:text-red-100 transition-colors cursor-pointer"
                aria-label="Cerrar alerta"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article principal */}
      <article className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 grid grid-cols-1 lg:grid-cols-2 w-full min-h-screen relative overflow-x-hidden lg:overflow-hidden">
        {/* Bloque rotado con gradiente corporativo - Oculto en móvil para no interferir */}
        <div
          className={`hidden lg:block absolute -bottom-20 z-0 bg-gradient-to-br from-[#0C447C] via-[#1c6554] to-[#0a5a47] dark:from-blue-700 dark:via-green-700 dark:to-teal-800 w-[200%] h-[200%] transition-all duration-1000 ease-in-out shadow-2xl ${
            isSignUp ? 'rotate-[-57deg] left-[-115%]' : 'rotate-[57deg] left-[15%]'
          }`}
          aria-hidden="true"
        />

        {/* Elementos decorativos (círculos de fondo) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className={`absolute w-96 h-96 bg-white/5 dark:bg-white/10 rounded-full blur-3xl transition-all duration-1000 ${isSignUp ? 'top-20 -right-20' : '-top-20 -left-20'}`}></div>
          <div className={`absolute w-64 h-64 bg-white/5 dark:bg-white/10 rounded-full blur-2xl transition-all duration-1000 ${isSignUp ? 'bottom-40 left-20' : 'bottom-20 right-40'}`}></div>
        </div>

        {/* LOGIN FORM */}
        <form
          onSubmit={handleLoginSubmit}
          className={`items-center justify-center relative z-10 row-start-1 col-start-1 px-4 sm:px-8 lg:px-20 xl:px-24 py-20 sm:py-10 min-h-screen lg:min-h-0 overflow-y-auto ${
            isInitialMount ? 'opacity-0' : ''
          } ${loginFormClass} ${
            isSignUp ? 'hidden lg:grid' : 'flex'
          }`}
          style={isInitialMount ? { animation: 'fadeIn 0.6s ease-out 0.2s forwards' } : undefined}
        >
          {/* Card contenedor con efecto de vidrio */}
          <div className="bg-white/95 dark:bg-slate-900/95 lg:bg-white/80 lg:dark:bg-slate-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 dark:border-slate-700/50 w-full max-w-md">
            <AuthFormHeader title="Iniciar sesión" />

            <div className="space-y-5">
              <AuthField
                id="login-email"
                label="Correo electrónico"
                type="email"
                value={loginData.email}
                onChange={(email) => setLoginData((prev) => ({ ...prev, email }))}
                icon={<UserIcon />}
              />

              <AuthField
                id="login-password"
                label="Contraseña"
                type="password"
                value={loginData.password}
                onChange={(password) => setLoginData((prev) => ({ ...prev, password }))}
                icon={<LockIcon />}
              />

              <SubmitButton loading={isLoading} disabled={isAnimating} label="Iniciar sesión" loadingLabel="Iniciando..." />

              <p className="text-base text-center text-slate-700 dark:text-slate-300 font-normal pt-4">
                ¿No tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode(true)}
                  disabled={isAnimating}
                  className="font-bold text-[#1c6554] dark:text-green-400 hover:text-[#1c6554]/70 dark:hover:text-green-300 transition-colors cursor-pointer"
                >
                  Regístrate
                </button>
              </p>
            </div>
          </div>
        </form>

        {/* TEXTO DERECHO (visible en modo login) */}
        <div
          className={`hidden lg:flex flex-col justify-center items-end gap-4 relative z-10 row-start-1 col-start-2 px-12 lg:px-20 xl:px-24 ${
            isInitialMount ? 'opacity-0' : ''
          } ${loginTextClass}`}
          style={isInitialMount ? { animation: 'fadeIn 0.6s ease-out 0.35s forwards' } : undefined}
        >
          <h3 className="text-4xl xl:text-5xl uppercase font-black text-white max-w-[320px] text-right leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
            ¡Bienvenido!
          </h3>
          <p className="text-white/95 max-w-[320px] text-right text-base leading-relaxed font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            Ingresa tus credenciales para acceder a ofertas exclusivas y recibir tus productos frescos en casa.
          </p>
        </div>

        {/* TEXTO IZQUIERDO (visible en modo registro) */}
        <div
          className={`hidden lg:flex flex-col justify-center items-start gap-4 relative z-10 row-start-1 col-start-1 px-12 lg:px-20 xl:px-24 ${
            isInitialMount ? 'opacity-0' : ''
          } ${registerTextClass}`}
          style={isInitialMount ? { animation: 'fadeIn 0.6s ease-out 0.35s forwards' } : undefined}
        >
          <h3 className="text-4xl xl:text-5xl uppercase font-black text-white max-w-[320px] text-left leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
            ¡Únete!
          </h3>
          <p className="text-white/95 max-w-[320px] text-left text-base leading-relaxed font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            Crea tu cuenta y disfruta de envío gratis, ofertas exclusivas y entregas en menos de 30 minutos.
          </p>
        </div>

        {/* REGISTER FORM */}
        <form
          onSubmit={handleRegisterSubmit}
          className={`items-start justify-center relative z-10 row-start-1 col-start-1 lg:col-start-2 px-4 sm:px-8 lg:px-20 xl:px-24 py-20 sm:py-10 overflow-y-auto min-h-screen lg:max-h-screen custom-scrollbar ${
            isInitialMount ? 'opacity-0' : ''
          } ${registerFormClass} ${
            isSignUp ? 'flex' : 'hidden lg:flex'
          }`}
          style={isInitialMount ? { animation: 'fadeIn 0.6s ease-out 0.2s forwards' } : undefined}
        >
          {/* Card contenedor con efecto de vidrio */}
          <div className="bg-white/95 dark:bg-slate-900/95 lg:bg-white/80 lg:dark:bg-slate-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 dark:border-slate-700/50 w-full max-w-md my-auto">
            <AuthFormHeader title="Crear cuenta" />

            <div className="space-y-4">
              <AuthField
                id="register-name"
                label="Nombre completo"
                value={registerData.name}
                onChange={(name) => setRegisterData((prev) => ({ ...prev, name }))}
                icon={<UserIcon />}
              />

              <AuthField
                id="register-email"
                label="Correo electrónico"
                type="email"
                value={registerData.email}
                onChange={(email) => setRegisterData((prev) => ({ ...prev, email }))}
                icon={<EmailIcon />}
              />

              <AuthField
                id="register-phone"
                label="Teléfono"
                type="tel"
                value={registerData.phone}
                onChange={(phone) => setRegisterData((prev) => ({ ...prev, phone }))}
                icon={<PhoneIcon />}
              />

              <AuthField
                id="register-password"
                label="Contraseña"
                type="password"
                value={registerData.password}
                onChange={(password) => setRegisterData((prev) => ({ ...prev, password }))}
                icon={<LockIcon />}
                minLength={8}
              />

              {/* Requisitos de contraseña */}
              <div className="text-xs text-slate-600 dark:text-slate-400 -mt-2 px-1">
                <p className="font-semibold mb-1.5">La contraseña debe tener:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1.5">
                  <li className={`flex items-center gap-1.5 ${registerData.password.length >= 8 ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${registerData.password.length >= 8 ? 'bg-green-600 dark:bg-green-400' : 'bg-slate-400 dark:bg-slate-500'}`}></span>
                    Mínimo 8 caracteres
                  </li>
                  <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(registerData.password) ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${/[A-Z]/.test(registerData.password) ? 'bg-green-600 dark:bg-green-400' : 'bg-slate-400 dark:bg-slate-500'}`}></span>
                    Una mayúscula
                  </li>
                  <li className={`flex items-center gap-1.5 ${/[a-z]/.test(registerData.password) ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${/[a-z]/.test(registerData.password) ? 'bg-green-600 dark:bg-green-400' : 'bg-slate-400 dark:bg-slate-500'}`}></span>
                    Una minúscula
                  </li>
                  <li className={`flex items-center gap-1.5 ${/\d/.test(registerData.password) ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${/\d/.test(registerData.password) ? 'bg-green-600 dark:bg-green-400' : 'bg-slate-400 dark:bg-slate-500'}`}></span>
                    Un número
                  </li>
                </ul>
              </div>

              <AuthField
                id="register-confirm-password"
                label="Confirmar contraseña"
                type="password"
                value={registerData.confirmPassword}
                onChange={(confirmPassword) => setRegisterData((prev) => ({ ...prev, confirmPassword }))}
                icon={<LockIcon />}
                minLength={8}
              />

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 w-4 h-4 accent-[#1c6554] dark:accent-green-500 cursor-pointer rounded"
                />
                <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer leading-relaxed">
                  Acepto los{' '}
                  <a href="/terminos" className="text-[#1c6554] dark:text-green-400 hover:underline font-semibold">
                    términos y condiciones
                  </a>
                  {' '}y la{' '}
                  <a href="/privacidad" className="text-[#1c6554] dark:text-green-400 hover:underline font-semibold">
                    política de privacidad
                  </a>
                </label>
              </div>

              <SubmitButton loading={isLoading} disabled={isAnimating} label="Crear cuenta" loadingLabel="Creando..." />

              <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-base text-slate-600 dark:text-slate-400">
                  ¿Ya tienes una cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode(false)}
                    disabled={isAnimating}
                    className="font-bold text-[#1c6554] dark:text-green-400 hover:text-[#1c6554]/70 dark:hover:text-green-300 transition-colors cursor-pointer"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            </div>
          </div>
        </form>
    </article>
    </>
  );
}

type PanelId = 'login-form' | 'login-text' | 'register-text' | 'register-form';

/** Controla visibilidad y animación de cada panel según el modo activo */
function getPanelAnimationClass(panel: PanelId, isSignUp: boolean, hasInteracted: boolean): string {
  if (!hasInteracted) {
    const visible = {
      'login-form': !isSignUp,
      'login-text': !isSignUp,
      'register-text': isSignUp,
      'register-form': isSignUp,
    };
    return visible[panel] ? 'relative' : 'invisible relative';
  }

  const classes: Record<PanelId, { login: string; register: string }> = {
    'login-form': {
      login: 'relative animate-auth-appear-left',
      register: 'invisible relative animate-auth-hide-left',
    },
    'login-text': {
      login: 'relative animate-auth-appear-right',
      register: 'invisible relative animate-auth-hide-right',
    },
    'register-text': {
      login: 'invisible relative animate-auth-hide-left',
      register: 'relative animate-auth-appear-left',
    },
    'register-form': {
      login: 'invisible relative animate-auth-hide-right',
      register: 'relative animate-auth-appear-right',
    },
  };

  return isSignUp ? classes[panel].register : classes[panel].login;
}

function AuthFormHeader({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-center lg:text-left text-slate-900 dark:text-white mb-3">
        {title}
      </h2>
      <div className="w-16 h-1.5 bg-gradient-to-r from-[#0C447C] to-[#1c6554] dark:from-blue-500 dark:to-green-500 rounded-full mx-auto lg:mx-0 mb-8 shadow-md"></div>
    </div>
  );
}

function SubmitButton({
  loading,
  disabled,
  label,
  loadingLabel,
}: {
  loading: boolean;
  disabled: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="relative bg-gradient-to-r from-[#0C447C] to-[#1c6554] dark:from-blue-600 dark:to-green-600 text-white py-3.5 px-6 rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer group overflow-hidden"
    >
      {/* Efecto de brillo al hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
      
      {/* Contenido del botón */}
      <span className="relative z-10">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner />
            {loadingLabel}
          </span>
        ) : (
          label
        )}
      </span>
    </button>
  );
}

function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

