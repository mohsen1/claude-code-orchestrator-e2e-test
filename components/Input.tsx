import React, { InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({
  label,
  error,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          appearance-none relative block w-full px-3 py-2
          border ${error ? 'border-red-300' : 'border-gray-300'}
          placeholder-gray-500 text-gray-900 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary-500
          focus:border-primary-500 focus:z-10 sm:text-sm
          ${error ? 'focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
