import React from 'react';

export function CarivueLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Carivue "C" icon */}
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16c4.07 0 7.79-1.52 10.614-4.022"
          stroke="#1F3A4A"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-2xl font-bold text-primary tracking-wide">Carivue</span>
    </div>
  );
}
