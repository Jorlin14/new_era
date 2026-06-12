/**
 * Input Component - New Era Supermercado
 * 
 * Componente de input reutilizable con mejor contraste y accesibilidad
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-semibold text-slate-900 mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-2.5 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1c6554] focus:border-transparent transition-all ${className}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
