'use client';

import Link from 'next/link';
import { useState } from 'react';

// Componente para los items desplegables
function AccordionItem({ title, children, icon }: { title: React.ReactNode; children: React.ReactNode; icon?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-4 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-slate-400">{icon}</span>}
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-lg">{title}</span>
        </div>
        <div className={`w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : ''}`}>
          <ChevronIcon />
        </div>
      </button>

      {/* Contenedor animado para el contenido */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="p-5 border-t border-slate-100 dark:border-slate-800">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 animate-page-enter">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#1c6554] via-[#144f41] to-[#0C447C] dark:from-green-900 dark:via-green-800 dark:to-blue-900 pt-24 pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-white blur-[100px] mix-blend-overlay"></div>
          <div className="absolute top-1/2 -left-24 w-[400px] h-[400px] rounded-full bg-green-400 blur-[100px] mix-blend-overlay"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-base font-semibold mb-8 transition-colors bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm shadow-sm"
          >
            ← Volver a la tienda
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">
            ¿Cómo podemos ayudarte?
          </h1>
          <p className="text-lg md:text-xl text-green-50 max-w-2xl mx-auto font-light leading-relaxed drop-shadow">
            Encuentra respuestas rápidas a tus dudas o comunícate con nuestro equipo de soporte. Estamos aquí para ti.
          </p>
        </div>

        {/* Efecto de Fusión / Degradado hacia el fondo de la página */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-950 dark:to-transparent pointer-events-none"></div>
      </div>

      {/* Content Grid (Una sola columna, tarjetas grandes) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="space-y-10">

          {/* Preguntas Frecuentes */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover-lift">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <QuestionIcon />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Preguntas Frecuentes</h2>
            </div>

            <div className="mt-4">
              <AccordionItem title="¿Cómo puedo realizar un pedido?">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">Simplemente navega por nuestro catálogo, agrega los productos a tu carrito y procede al checkout. Te guiaremos en cada paso del proceso.</p>
              </AccordionItem>
              <AccordionItem title="¿Cuál es el monto mínimo de compra?">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">No tenemos monto mínimo de compra. Puedes pedir desde un solo producto.</p>
              </AccordionItem>
              <AccordionItem title="¿Qué métodos de pago aceptan?">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">Aceptamos tarjetas de crédito, débito, PSE y pago contra entrega para tu comodidad.</p>
              </AccordionItem>
            </div>
          </div>

          {/* Política de Envío */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover-lift">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-[#1c6554] dark:text-green-400">
                <ShippingIcon />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Envíos y Cobertura</h2>
            </div>

            <div className="mt-4">
              <AccordionItem title="🚀 Entregas ultra rápidas">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                  Realizamos entregas en <strong>menos de 30 minutos</strong>. Tu pedido llegará volando directamente a tu puerta.
                </p>
              </AccordionItem>
              <AccordionItem title="Zona de Cobertura">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                  Actualmente tenemos cobertura exclusiva en la ciudad de <strong>Ibagué</strong>.
                </p>
              </AccordionItem>
              <AccordionItem title="Costo de Envío">
                <ul className="space-y-3 text-slate-600 dark:text-slate-400 text-lg">
                  <li className="flex items-center gap-3">
                    <CheckIcon /> <span className="font-medium text-slate-900 dark:text-slate-200">Envío gratis</span> en compras superiores a $100.000
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckIcon /> $2.200 COP en tu primera compra
                  </li>
                </ul>
              </AccordionItem>
            </div>
          </div>

          {/* Devoluciones */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover-lift">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                <ReturnIcon />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Devoluciones</h2>
            </div>

            <div className="mt-4">
              <AccordionItem title="¿Cuándo puedo devolver un producto?">
                <ul className="space-y-3 text-slate-600 dark:text-slate-400 text-lg">
                  <li className="flex items-start gap-3">
                    <DotIcon /> El producto llegó en mal estado
                  </li>
                  <li className="flex items-start gap-3">
                    <DotIcon /> Recibiste un producto equivocado
                  </li>
                </ul>
              </AccordionItem>
              <AccordionItem title="Proceso de Devolución">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg mb-4">
                  Contacta a nuestro equipo de soporte dentro de las <strong>24 horas</strong> siguientes a la entrega y envíanos fotos del producto.
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                  Los reembolsos se procesan en un plazo de 3-5 días hábiles y se acreditan al método de pago original.
                </p>
              </AccordionItem>
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 hover-lift">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                <ContactIcon />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Contáctanos</h2>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg mb-8">
              Estamos disponibles para ayudarte de <strong>Lunes a Domingo de 7:00 AM a 10:00 PM</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <a href="https://wa.me/573001234567" target="_blank" rel="noreferrer" className="flex items-center gap-5 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group cursor-pointer border border-transparent hover:border-green-200 dark:hover:border-green-800">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                  <WhatsAppIcon />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">WhatsApp</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">+57 300 123 4567</p>
                </div>
              </a>

              <a href="mailto:soporte@newerasupermercado.com" className="flex items-center gap-5 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <EmailIcon />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Correo Electrónico</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">soporte@newera.com</p>
                </div>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
function ChevronIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShippingIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg className="w-4 h-4 text-orange-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="4" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.373-.043c.098-.115.424-.491.539-.66.115-.17.231-.142.39-.085s1.012.477 1.186.564c.174.087.289.129.332.202.043.073.043.423-.101.827z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
