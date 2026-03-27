"use client";

import { GaugeChart } from "./GaugeChart";
import { Plus } from "lucide-react";

interface Site {
  id: string;
  name: string;
  csi: number;
  status: string;
  layer: string;
}

interface SitesOverviewProps {
  sites: Site[];
}

export function SitesOverview({ sites }: SitesOverviewProps) {
  const strainedSitesCount = sites.filter((site) => site.status !== "Stable").length;

  return (
    <div className="bg-[#FAFBFD] p-8 rounded-3xl border border-gray-100/50 mt-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-[#1F3A4A] mb-1">Sites Overview</h2>
          <p className="text-sm text-gray-500 font-medium">Service Performance Overview</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1F3A4A] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#2c4e62] transition-colors shadow-sm">
          <Plus size={18} />
          Add New Site
        </button>
      </div>

      <div className="flex gap-4 mb-8 text-sm font-bold text-[#1F3A4A]">
        <span>Total Sites: {sites.length}</span>
        <span className="text-gray-300">|</span>
        <span>Sites in Emerging/Elevated Strain: {strainedSitesCount}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {sites.map((site) => (
          <div key={site.id} className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm flex flex-col items-center text-center">
            <h3 className="text-base font-bold text-[#1F3A4A] mb-1">{site.name}</h3>
            <p className="text-[10px] text-gray-400 font-bold mb-6 tracking-wide uppercase">Carivue Stability Index (CSI)</p>
            
            <div className="mb-4">
              <GaugeChart 
                value={site.csi} 
                label={`${site.csi}%`} 
                status={site.status}
                size={160}
                strokeWidth={12}
              />
            </div>
            
            <p className="text-sm font-bold text-[#1F3A4A] mt-2 mb-6">
              Dominant Layer: <span className="font-semibold">{site.layer}</span>
            </p>
            
            <button className="w-full bg-[#1F3A4A] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#2c4e62] transition-colors">
              View More Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
