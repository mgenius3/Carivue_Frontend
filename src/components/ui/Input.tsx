import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export function Input({ label, error, rightElement, className = '', id, ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-sm font-semibold text-text mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          className={`w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-text placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition
            ${error ? 'border-error' : ''} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}
