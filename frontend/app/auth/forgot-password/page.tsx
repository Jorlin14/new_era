/**
 * Forgot Password Page — New Era Supermercado
 *
 * Formulario de recuperación de contraseña (simulado, sin backend aún).
 *
 * @module app/auth/forgot-password/page
 */

'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';

export default function ForgotPasswordPage() {
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

        {/* FORMULARIO DE RECUPERACIÓN (WHATSAPP) */}
        <div
          className="grid gap-8 content-center relative z-10 row-start-1 col-start-1 lg:col-span-2 px-8 sm:px-12 lg:px-20 xl:px-32 py-10 max-w-2xl mx-auto w-full animate-auth-appear-left"
        >
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold text-center lg:text-left text-slate-900 dark:text-white mb-3">
              Recuperar contraseña
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-[#0C447C] to-[#1c6554] mx-auto lg:mx-0 mb-8"></div>
          </div>

          <div className="space-y-6 text-center lg:text-left">
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Por motivos de seguridad, para recuperar tu cuenta debes contactar directamente con nuestro equipo de soporte a través de WhatsApp.
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-sm">
              Haz clic en el botón de abajo. Te generaremos una nueva contraseña temporal segura al instante para que puedas volver a ingresar.
            </p>

            <a
              href="https://wa.me/573000000000?text=Hola,%20olvid%C3%A9%20la%20contrase%C3%B1a%20de%20mi%20cuenta%20en%20New%20Era%20Supermercado.%20%C2%BFMe%20pueden%20ayudar%20a%20restablecerla?"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 px-6 rounded-lg font-bold text-lg hover:scale-[1.02] transition-transform hover-lift shadow-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Contactar por WhatsApp
            </a>

            <div className="text-center pt-6 border-t border-slate-200 dark:border-slate-700 mt-8">
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
          </div>
        </div>
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
