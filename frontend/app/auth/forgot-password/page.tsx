/**
 * Forgot Password Page — New Era Supermercado
 *
 * Formulario de recuperación de contraseña (simulado, sin backend aún).
 *
 * @module app/auth/forgot-password/page
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import AuthField from '@/components/auth/AuthField';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setIsLoading(false);
    setSent(true);
  }

  return (
    <div className="animate-page-enter">
      {/* Logo fijo superior derecho */}
      <div className="fixed top-4 right-4 z-[9999] transition-all hover:scale-110 pointer-events-auto" style={{
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
      }}>
        <Logo size="xl" />
      </div>

      {/* Botón volver al inicio */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-[9999] flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white backdrop-blur-sm border border-slate-200 text-slate-700 hover:text-slate-900 transition-all hover:shadow-md group pointer-events-auto"
      >
        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">Volver al inicio</span>
      </Link>

      <article className="bg-white dark:bg-slate-900 grid grid-cols-1 lg:grid-cols-2 w-full h-screen relative overflow-hidden">
        {/* Bloque rotado con gradiente corporativo */}
        <div
          className="absolute bottom-0 bg-gradient-to-br from-[#0C447C] to-[#1c6554] w-[200%] h-[200%] rotate-[57deg] left-[15%] transition-all duration-1000 ease-in-out"
          aria-hidden="true"
        />

        {/* FORMULARIO DE RECUPERACIÓN */}
        <form
          onSubmit={handleSubmit}
          className="grid gap-8 content-center relative z-10 row-start-1 col-start-1 lg:col-span-2 px-8 sm:px-12 lg:px-20 xl:px-32 py-10 max-w-2xl mx-auto w-full animate-auth-appear-left"
        >
          {/* Header del formulario */}
          <div>
            <h2 className="text-3xl font-bold text-center lg:text-left text-slate-900 dark:text-white mb-3">
              Recuperar contraseña
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-[#0C447C] to-[#1c6554] mx-auto lg:mx-0 mb-8"></div>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 leading-relaxed">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold mb-1">¡Correo enviado!</p>
                    <p className="text-sm">
                      Si el correo <strong>{email}</strong> está registrado, recibirás instrucciones en breve.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/auth"
                className="block text-center py-3.5 bg-gradient-to-r from-[#0C447C] to-[#1c6554] text-white font-semibold hover:scale-[1.02] transition-transform hover-lift"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <p className="text-slate-600 dark:text-slate-400 text-base -mt-4">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <AuthField
                id="forgot-email"
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={setEmail}
                icon={<EmailIcon />}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-[#0C447C] to-[#1c6554] text-white py-3.5 font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner />
                    Enviando...
                  </span>
                ) : (
                  'Enviar enlace de recuperación'
                )}
              </button>

              <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-base text-slate-600 dark:text-slate-400">
                  ¿Recordaste tu contraseña?{' '}
                  <Link
                    href="/auth"
                    className="font-bold text-[#1c6554] hover:text-[#1c6554]/70 transition-colors underline underline-offset-2"
                  >
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </>
          )}
        </form>
      </article>
    </div>
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
