"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { getPeriodLabel } from "@/lib/reporting";

interface TrendChartProps {
  data: any[];
  title?: string;
  periodLabel?: string;
}

export function TrendChart({
  data,
  title = "Strain Trend",
  periodLabel,
}: TrendChartProps) {
  const resolvedPeriodLabel = periodLabel || getPeriodLabel(data.length);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-[#1F3A4A]">{title}</h3>
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{resolvedPeriodLabel}</span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F3F5" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '12px'
              }} 
            />
            <Legend 
                verticalAlign="bottom" 
                align="center" 
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px' }}
            />
            
            <Line
              type="monotone"
              dataKey="csi"
              name="CSI (%) - Operational Load"
              stroke="#6366F1"
              strokeWidth={3}
              dot={{ r: 6, fill: '#6366F1', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="mod"
              name="MOD (%) - Managerial Stabilisation"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="csd"
              name="CSD (%) - Clinical Stabilisation"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={{ r: 6, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
