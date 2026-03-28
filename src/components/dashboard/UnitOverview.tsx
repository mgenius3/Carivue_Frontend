"use client";

import React, { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { CircularProgress } from "./CircularProgress";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Unit {
  id: string | number;
  name: string;
  strain: number;
  status: string;
  highlights: string[];
  minCapacity?: number;
  maxCapacity?: number;
}

interface UnitOverviewProps {
  units: Unit[];
  onAddUnit?: () => void;
  onEditUnit?: (unit: Unit) => void;
}

export function UnitOverview({ units, onAddUnit, onEditUnit }: UnitOverviewProps) {
  const [activeUnitId, setActiveUnitId] = useState<string | number | undefined>(units[0]?.id);
  
  // Safety check: if activeUnitId is not in the current units list, reset it to the first unit
  const effectiveActiveUnitId = (activeUnitId && units.some(u => u.id === activeUnitId)) 
    ? activeUnitId 
    : units[0]?.id;

  const activeUnit = units.find(u => u.id === effectiveActiveUnitId) || units[0];

  if (!units.length || !activeUnit) {
    return (
      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[200px] mt-10">
        <p className="text-gray-400 font-medium">No units found for this site.</p>
        <button 
          onClick={onAddUnit}
          className="mt-4 flex items-center gap-2 text-primary font-bold text-sm hover:underline"
        >
          <Plus size={16} />
          Add your first unit
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#1F3A4A] mb-1">Unit Overview</h2>
          <p className="text-sm text-gray-400 font-medium">Unit Stability Overview</p>
        </div>
        <div className="flex items-center gap-3">
          {onEditUnit && activeUnit && (
            <button
              onClick={() => onEditUnit(activeUnit)}
              className="flex items-center gap-2 bg-white border border-gray-100 text-[#1F3A4A] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Pencil size={16} />
              Edit Unit
            </button>
          )}
          <button
            onClick={onAddUnit}
            className="flex items-center gap-2 bg-[#1F3A4A] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#2c4e62] transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add New Unit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-[#F9FAFB] p-1 rounded-xl w-fit">
        {units.map((unit) => (
          <button
            key={unit.id}
            onClick={() => setActiveUnitId(unit.id)}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeUnitId === unit.id
                ? "bg-[#C7791A] text-white shadow-md"
                : "text-gray-400 hover:text-[#1F3A4A]"
            )}
          >
            {unit.name}
          </button>
        ))}
      </div>

      {/* Detail Area */}
      <div className="grid md:grid-cols-2 gap-8 mt-4">
        {/* Progress Gauge */}
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <h3 className="text-base font-bold text-[#1F3A4A] mb-10">{activeUnit.name} - Strain Level</h3>
          <CircularProgress 
            value={activeUnit.strain} 
            label={`${activeUnit.strain}%`} 
            status={activeUnit.status} 
            size={200}
            strokeWidth={20}
          />
          <p className="mt-10 text-sm font-bold text-[#1F3A4A]">
            <span className="text-red-500">+18%</span> above Unit Baseline
          </p>
        </div>

        {/* Summary */}
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm min-h-[400px]">
          <h3 className="text-2xl font-bold text-[#1F3A4A] mb-4">Summary</h3>
          <p className="text-sm text-gray-500 leading-relaxed font-medium mb-8">
            Operational strain on the {activeUnit.name} is increasing, primarily driven by rising workforce compensation effort.
          </p>
          
          <ul className="space-y-4">
            {activeUnit.highlights.map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0"></div>
                <span className="text-sm font-bold text-[#1F3A4A]">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
