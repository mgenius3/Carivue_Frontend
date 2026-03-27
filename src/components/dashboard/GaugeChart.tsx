"use client";

import React from "react";

interface GaugeChartProps {
  value: number; // 0 to 100
  label?: string;
  status?: string;
  size?: number;
  strokeWidth?: number;
}

export function GaugeChart({ 
  value = 0, 
  label = "68%", 
  status = "Emerging Strain",
  size = 180,
  strokeWidth = 14
}: GaugeChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 1.6 }}>
        <svg 
          width={size} 
          height={size / 1.5} 
          viewBox={`0 0 ${size} ${size / 1.5}`}
        >
          {/* Background Arc */}
          <path
            d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Progress Arc - Multi-color gradient (Green to Red) */}
          <defs>
            <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22C55E" />    {/* Green */}
              <stop offset="50%" stopColor="#EAB308" />   {/* Yellow */}
              <stop offset="100%" stopColor="#EF4444" />  {/* Red */}
            </linearGradient>
          </defs>

          <path
            d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
            stroke="url(#gauge-gradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />

          {/* Needle */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2 + (radius - 5) * Math.cos(Math.PI + (value / 100) * Math.PI)}
            y2={size / 2 + (radius - 5) * Math.sin(Math.PI + (value / 100) * Math.PI)}
            stroke="#1F2937"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={size / 2} cy={size / 2} r="5" fill="#1F2937" />
        </svg>

        {/* Labels */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-2 text-center">
          <p className="text-2xl font-bold text-primary">{label}</p>
          <p className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{status}</p>
        </div>
      </div>
    </div>
  );
}
