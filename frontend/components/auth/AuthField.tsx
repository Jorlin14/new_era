/**
 * AuthField Component - New Era Supermercado
 * 
 * Campo de formulario con etiqueta flotante, icono y validación.
 * Usado en los formularios de autenticación (login y registro).
 * 
 * Características:
 * - Etiqueta flotante animada
 * - Icono decorativo
 * - Validación HTML5
 * - Siempre controlado (sin warnings de React)
 * - Estilos consistentes con el diseño corporativo
 * 
 * @module components/auth/AuthField
 */

'use client';

import { useState, type ReactNode } from 'react';

/** Props del componente AuthField */
interface AuthFieldProps {
  /** ID único del campo (para label y accesibilidad) */
  id: string;
  /** Texto de la etiqueta flotante */
  label: string;
  /** Tipo de input HTML (text, email, password, tel, etc.) */
  type?: string;
  /** Valor actual del campo (siempre string, nunca undefined) */
  value: string;
  /** Callback cuando cambia el valor */
  onChange: (value: string) => void;
  /** Icono SVG a mostrar a la derecha */
  icon: ReactNode;
  /** Longitud mínima del texto (validación HTML5) */
  minLength?: number;
  /** Si el campo es obligatorio */
  required?: boolean;
  /** Texto de placeholder opcional */
  placeholder?: string;
}

/**
 * Campo de formulario con etiqueta flotante e icono.
 * 
 * Usado en formularios de autenticación con animaciones CSS.
 * La etiqueta flota hacia arriba cuando el campo tiene focus o valor.
 * 
 * @param {AuthFieldProps} props - Propiedades del componente
 * @returns {JSX.Element} Campo de formulario renderizado
 * 
 * @example
 * <AuthField
 *   id="email"
 *   label="Correo electrónico"
 *   type="email"
 *   value={email}
 *   onChange={setEmail}
 *   icon={<EmailIcon />}
 *   required
 * />
 */
export default function AuthField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  icon,
  minLength,
  required = true,
  placeholder,
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Determinar si el label debe estar flotando (cuando hay valor o placeholder visible)
  const hasValue = value && value.length > 0;
  const shouldFloat = hasValue || placeholder;

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <fieldset className="relative group">
      {/* Contenedor del input con diseño moderno */}
      <div className="relative flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl focus-within:border-[#1c6554] dark:focus-within:border-green-500 focus-within:ring-4 focus-within:ring-[#1c6554]/10 dark:focus-within:ring-green-500/20 transition-all duration-200 shadow-sm hover:shadow-md">
        {/* Icono decorativo a la izquierda */}
        <span className="text-slate-500 dark:text-slate-400 group-focus-within:text-[#1c6554] dark:group-focus-within:text-green-400 shrink-0 transition-colors" aria-hidden="true">
          {icon}
        </span>
        
        {/* Input controlado */}
        <input
          id={id}
          type={inputType}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          className="outline-none peer flex-1 bg-transparent text-slate-900 dark:text-white text-base placeholder:text-slate-400 dark:placeholder:text-slate-500"
          aria-label={label}
        />

        {/* Botón de mostrar/ocultar contraseña */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-500 hover:text-[#1c6554] dark:text-slate-400 dark:hover:text-green-400 focus:outline-none focus:text-[#1c6554] dark:focus:text-green-400 p-1 shrink-0 transition-colors"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        )}
        
        {/* Etiqueta flotante con animación */}
        <label
          htmlFor={id}
          className={`absolute transition-all duration-200 pointer-events-none ${
            shouldFloat
              ? 'top-0 -translate-y-1/2 left-3 text-xs font-bold text-[#1c6554] dark:text-green-400 bg-white dark:bg-slate-800 px-2 z-10'
              : 'left-12 top-1/2 -translate-y-1/2 text-base text-slate-500 dark:text-slate-400 peer-focus:top-0 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-slate-800 peer-focus:px-2 peer-focus:text-[#1c6554] dark:peer-focus:text-green-400 peer-focus:font-bold peer-focus:z-10'
          }`}
        >
          {label}
        </label>
      </div>
    </fieldset>
  );
}
