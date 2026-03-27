"use client";

import { Info, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer 
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KpiCardProps {
  title: string;
  value?: string | number;
  status?: string;
  statusVariant?: "success" | "warning" | "error" | "info" | "neutral";
  trend?: string;
  trendDirection?: "up" | "down";
  children?: React.ReactNode;
  data?: any[]; // For sparkline
  color?: string; // For sparkline color
}

export function KpiCard({
  title,
  value,
  status,
  statusVariant = "neutral",
  trend,
  trendDirection,
  children,
  data,
  color = "#C7791A"
}: KpiCardProps) {
  const variantStyles = {
    success: "text-[#22C55E]",
    warning: "text-[#EAB308]",
    error: "text-[#EF4444]",
    info: "text-[#3b82f6]",
    neutral: "text-gray-500"
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-[#1F3A4A]">{title}</h3>
          <Info size={14} className="text-gray-400 cursor-help" />
        </div>
      </div>

      <div className="flex-1 flex items-end justify-between gap-4">
        <div className="z-10 bg-white/50 backdrop-blur-sm rounded-lg pr-2 py-1">
          {status && (
            <p className={cn("text-xl font-bold mb-1", variantStyles[statusVariant])}>
              {status}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1">
              {trendDirection === "up" ? (
                <ArrowUpRight size={14} className={variantStyles[statusVariant]} />
              ) : (
                <ArrowDownRight size={14} className={variantStyles[statusVariant]} />
              )}
              <span className="text-[10px] font-medium text-gray-500">
                <span className={variantStyles[statusVariant]}>{trend}</span> from last week
              </span>
            </div>
          )}
        </div>

        <div className="absolute right-0 bottom-0 w-1/2 h-2/3 opacity-40 group-hover:opacity-60 transition-opacity">
          {data ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#gradient-${title})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            children
          )}
        </div>
      </div>
      
      {!data && children && (
        <div className="mt-2 flex justify-center w-full">
            {children}
        </div>
      )}
    </div>
  );
}
