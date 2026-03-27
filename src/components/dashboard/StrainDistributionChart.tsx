"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface StrainDistributionItem {
  name: string;
  value: number;
  color: string;
}

interface StrainDistributionChartProps {
  data: StrainDistributionItem[];
}

export function StrainDistributionChart({ data }: StrainDistributionChartProps) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col items-center">
      <h2 className="text-base font-bold text-[#1F3A4A] mb-8">Strain Distribution</h2>
      
      <div className="h-[200px] w-full relative">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            No distribution data available yet.
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
