'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';
import { useEffect, useState } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Información dinámica: Reloj en tiempo real
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-[#0b2922] dark:bg-slate-950 border-t border-white/10 dark:border-slate-800/50">
      <div className="w-full mx-auto px-6 sm:px-12 lg:px-20 py-8">
        <div className="flex flex-col xl:flex-row items-center xl:items-start justify-between gap-8">

          {/* Lado Izquierdo: Logo grande y texto a su lado */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 xl:max-w-2xl">
            <div className="flex-shrink-0 pt-1">
              {/* Logo más grande */}
              <Logo size="xl" disableHoverEffect={true} />
            </div>
            <div className="flex flex-col justify-center">
              {/* El primer texto que tenía el footer */}
              <p className="text-base text-white/80 dark:text-slate-300 font-medium leading-relaxed mb-2">
                Tu supermercado de confianza.<br />Productos frescos y de calidad directo a tu hogar.
              </p>
              <div className="text-sm text-white/60 dark:text-slate-500 font-light space-y-1">
                <p>© {currentYear} New Era Domicilios. Del super a tu puerta.</p>
                <p>
                  <a href="https://lordicon.com/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/80 transition-colors">
                    Icons by Lordicon.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Información dinámica arriba y botones abajo */}
          <div className="flex flex-col items-center xl:items-end justify-center mt-6 xl:mt-0">

            {/* Información Dinámica */}
            <div className="mb-6 flex flex-wrap items-center justify-center xl:justify-end gap-6">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-lg leading-none">🚀</span>
                <p className="text-sm font-medium text-white/90">
                  Entregas en menos de 30 min
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <p className="text-sm font-medium text-white/90">
                  Operando en Ibagué {currentTime && <span className="opacity-70 ml-1">| Hora local: {currentTime}</span>}
                </p>
              </div>
            </div>

            {/* Enlaces y Botón */}
            <nav className="flex flex-wrap items-center justify-center lg:justify-end gap-10 text-sm">
              <Link href="/ayuda" className="text-white/80 hover:text-white hover:underline underline-offset-4 decoration-white/40 transition-all font-medium">
                Centro de Ayuda
              </Link>
              <Link href="/terminos" className="text-white/80 hover:text-white hover:underline underline-offset-4 decoration-white/40 transition-all font-medium">
                Términos de Servicio
              </Link>
              <Link href="/privacidad" className="text-white/80 hover:text-white hover:underline underline-offset-4 decoration-white/40 transition-all font-medium">
                Política de Privacidad
              </Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-white hover:underline underline-offset-4 decoration-white/40 font-semibold transition-all flex items-center gap-1.5 group ml-2"
              >
                Volver al inicio
                <svg className="w-4 h-4 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </nav>

          </div>

        </div>
      </div>
    </footer>
  );
}
