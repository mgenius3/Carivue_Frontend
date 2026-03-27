"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getPeriodLabel } from "@/lib/reporting";

interface SignalTrendChartProps {
  data: Array<{ name: string; oai: number; mod: number; csd: number }>;
}

export function SignalTrendChart({ data }: SignalTrendChartProps) {
  return (
    <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm h-[450px]">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-base font-bold text-[#1F3A4A] mb-1">Signal Trend</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{getPeriodLabel(data.length)}</p>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 700 }}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend 
              verticalAlign="bottom" 
              align="center" 
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
            />
            <Line 
              type="monotone" 
              dataKey="oai" 
              name="OAI-OC: Operational Overtime" 
              stroke="#C7791A" 
              strokeWidth={2} 
              dot={{ r: 4, fill: "#C7791A", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="mod" 
              name="MOD-OC: Managerial Stabilisation" 
              stroke="#1F3A4A" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              dot={{ r: 4, fill: "#1F3A4A", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="csd" 
              name="CSD-OC: Clinical Stabilisation" 
              stroke="#22C55E" 
              strokeWidth={2} 
              strokeDasharray="2 2"
              dot={{ r: 4, fill: "#22C55E", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
