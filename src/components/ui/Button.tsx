import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  fullWidth = true,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'py-3 px-6 rounded-md font-semibold text-sm transition-all duration-200 cursor-pointer';
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80',
    outline: 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-50',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
