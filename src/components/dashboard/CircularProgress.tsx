"use client";

import React from "react";

interface CircularProgressProps {
  value: number; // 0 to 100
  label: string;
  status: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function CircularProgress({
  value = 0,
  label = "79%",
  status = "Escalating Strain",
  size = 180,
  strokeWidth = 16,
  color = "#E05B5B" // Red for escalating
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
            width={size} 
            height={size} 
            className="rotate-[-90deg]"
        >
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F3F4F6"
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />
        </svg>

        {/* Labels Inside */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-3xl font-bold text-[#1F3A4A]">{label}</p>
          <p className="text-[10px] text-red-500 font-bold leading-tight uppercase tracking-wide">{status}</p>
        </div>
      </div>
    </div>
  );
}
