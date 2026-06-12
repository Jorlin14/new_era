/**
 * Select Component - New Era Supermercado
 * 
 * Componente de select reutilizable con mejor contraste
 */

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export default function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-semibold text-slate-900 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          {...props}
          className={`w-full px-4 py-2.5 border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1c6554] focus:border-transparent appearance-none cursor-pointer hover:border-slate-400 transition-all ${className}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-white text-slate-900">
              {option.label}
            </option>
          ))}
        </select>
        {/* Icono de flecha */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
