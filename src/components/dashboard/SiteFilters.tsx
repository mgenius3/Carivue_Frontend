"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SiteFiltersProps {
  activeSite: string;
  onChange: (siteId: string) => void;
  sites: { id: string; name: string }[];
}

export function SiteFilters({ activeSite, onChange, sites }: SiteFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
      <button
        onClick={() => onChange("all")}
        className={cn(
          "px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
          activeSite === "all"
            ? "bg-[#C7791A] text-white shadow-md"
            : "bg-white text-gray-400 hover:bg-gray-50 border border-transparent"
        )}
      >
        All Sites
      </button>
      
      {sites.map((site) => (
        <button
          key={site.id}
          onClick={() => onChange(site.id)}
          className={cn(
            "px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border",
            activeSite === site.id
              ? "bg-[#C7791A] text-white border-[#C7791A] shadow-md"
              : "bg-white text-gray-400 border-gray-50 hover:bg-gray-50"
          )}
        >
          {site.name}
        </button>
      ))}
    </div>
  );
}
