"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SiteFilters } from "@/components/dashboard/SiteFilters";
import { SitesOverview } from "@/components/dashboard/SitesOverview";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { OperationalReview } from "@/components/dashboard/OperationalReview";
import { StrainDistributionChart } from "@/components/dashboard/StrainDistributionChart";
import { UnitOverview } from "@/components/dashboard/UnitOverview";
import { AddUnitModal } from "@/components/dashboard/modals/AddUnitModal";
import { AddSiteModal } from "@/components/dashboard/modals/AddSiteModal";
import { Calendar, Download, RefreshCw, Plus } from "lucide-react";

const allSites = [
  { id: "willowbrooks", name: "Willowbrooks Care Home" },
  { id: "riversides", name: "Riversides Residential Care" },
  { id: "oakwoods", name: "Oakwoods Supported Living" },
];

const mockTrendData = [
  { name: "Week 1", csi: 60, mod: 55, csd: 40 },
  { name: "Week 2", csi: 65, mod: 62, csd: 50 },
  { name: "Week 3", csi: 75, mod: 70, csd: 45 },
  { name: "Week 4", csi: 78, mod: 65, csd: 30 },
  { name: "Week 5", csi: 70, mod: 75, csd: 25 },
  { name: "Week 6", csi: 50, mod: 45, csd: 35 },
];

const sparklineData = [
    { value: 10 }, { value: 15 }, { value: 8 }, { value: 12 }, { value: 20 }, { value: 18 }, { value: 25 }
];

const unitData = [
  { 
    id: "g-floor", 
    name: "Ground Floor", 
    strain: 79, 
    status: "Escalating Strain", 
    highlights: [
        "4 uncovered absences requiring cover",
        "6 additional support hours delivered",
        "1 active risk review"
    ]
  },
  { 
    id: "f-floor", 
    name: "First Floor", 
    strain: 45, 
    status: "Stable", 
    highlights: [
        "All shifts fully covered",
        "No reported clinical incidents",
        "Managerial support within range"
    ]
  },
  { 
    id: "d-floor", 
    name: "Dementia Floor", 
    strain: 62, 
    status: "Emerging Strain", 
    highlights: [
        "Increased clinical oversight required",
        "2 staff on sick leave",
        "Active safeguarding review"
    ]
  },
];

const sitesOverviewData = [
    { id: "1", name: "Willowbrooks Care Home", csi: 74, status: "Escalating Strain", layer: "OAI" },
    { id: "2", name: "Riversides Residential Care", csi: 66, status: "Emerging Strain", layer: "MOD" },
    { id: "3", name: "Oakwoods Supported Living", csi: 52, status: "Stable", layer: "Balanced" },
];

export default function SitesPage() {
  const [activeSiteId, setActiveSiteId] = useState("all");
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);

  return (
    <DashboardLayout title="Executive Dashboard">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3A4A] mb-1">Sites</h1>
          <p className="text-sm text-gray-400 font-medium tracking-wide">Overview of operational strain across all sites</p>
        </div>

        <div className="flex justify-between items-center gap-4">
          <SiteFilters 
            activeSite={activeSiteId} 
            onChange={setActiveSiteId} 
            sites={allSites} 
          />
          <button 
            onClick={() => setIsAddSiteModalOpen(true)}
            className="flex items-center gap-2 bg-[#1F3A4A] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#2c4e62] transition-colors shadow-sm shrink-0"
          >
            <Plus size={18} />
            Add New Site
          </button>
        </div>

        {activeSiteId === "all" ? (
          /* ALL SITES VIEW */
          <div className="space-y-10">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold text-[#1F3A4A] mb-2 tracking-tight">All Sites</h2>
                <div className="flex gap-4 text-xs font-bold text-gray-400">
                    <span>3 Total Sites</span>
                    <span className="text-gray-200">|</span>
                    <span>132 Residents</span>
                    <span className="text-gray-200">|</span>
                    <span>2 Sites in Emerging/Elevated Strain</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
                  <Calendar size={14} className="text-gray-400" />
                  Current Week
                </button>
                <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
                  <Download size={14} className="text-gray-400" />
                  Export
                </button>
                <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
                  <RefreshCw size={14} className="text-gray-400" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {sitesOverviewData.map(site => (
                  <div key={site.id} className="bg-white p-10 rounded-3xl border border-gray-50 shadow-sm flex flex-col items-center text-center">
                    <h3 className="text-base font-bold text-[#1F3A4A] mb-1">{site.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold mb-8 tracking-wide uppercase">Carivue Stability Index (CSI)</p>
                    
                    <div className="mb-6">
                      <GaugeChart value={site.csi} label={`${site.csi}%`} status={site.status} size={180} strokeWidth={14} />
                    </div>
                    
                    <p className="text-sm font-bold text-[#1F3A4A] mt-2 mb-8">
                      Dominant Layer: <span className="font-semibold">{site.layer}</span>
                    </p>
                    
                    <button 
                      onClick={() => setActiveSiteId(site.id === "1" ? "willowbrooks" : site.id === "2" ? "riversides" : "oakwoods")}
                      className="w-full bg-[#1F3A4A] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#2c4e62] transition-colors"
                    >
                      View More Details
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          /* SPECIFIC SITE VIEW */
          <div className="space-y-10">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold text-[#1F3A4A] mb-1">Victoria Island Care Home</h2>
                <p className="text-xs text-gray-400 font-bold lowercase tracking-wide">Residential Care • 3 Units • 48 Residents</p>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
                  <Calendar size={14} className="text-gray-400" />
                  Current Week
                </button>
                <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
                  <Download size={14} className="text-gray-400" />
                  Export
                </button>
                <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
                  <RefreshCw size={14} className="text-gray-400" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid md:grid-cols-4 gap-6">
                <KpiCard title="Carivue Stability Index (CSI)">
                    <GaugeChart value={74} label="74%" status="Escalating Strain" size={140} strokeWidth={10} />
                </KpiCard>
                <KpiCard 
                    title="OAI Score" 
                    status="Elevated" 
                    statusVariant="error" 
                    trend="12%" 
                    trendDirection="up" 
                    data={sparklineData}
                    color="#EF4444"
                />
                <KpiCard 
                    title="MOD Score" 
                    status="Stable but rising" 
                    statusVariant="warning" 
                    trend="6%" 
                    trendDirection="up" 
                    data={sparklineData}
                    color="#EAB308"
                />
                <KpiCard 
                    title="CSD Score" 
                    status="Normal" 
                    statusVariant="success" 
                    trend="2%" 
                    trendDirection="down" 
                    data={sparklineData}
                    color="#22C55E"
                />
            </div>

            {/* Site Strain Trend Chart */}
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm h-[450px]">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-base font-bold text-[#1F3A4A]">Site Strain Trend</h3>
                    <div className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold text-gray-400">
                        <Calendar size={12} />
                        Last 6 Weeks
                    </div>
                </div>
                <TrendChart data={mockTrendData} />
            </div>

            {/* Review and Distribution */}
            <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <OperationalReview />
                </div>
                <div className="lg:col-span-2">
                    <StrainDistributionChart />
                </div>
            </div>

            {/* Unit Overview */}
            <UnitOverview 
                units={unitData} 
                onAddUnit={() => setIsAddUnitModalOpen(true)}
            />
          </div>
        )}
      </div>

      <AddUnitModal 
        isOpen={isAddUnitModalOpen} 
        onClose={() => setIsAddUnitModalOpen(false)} 
      />
      
      <AddSiteModal 
        isOpen={isAddSiteModalOpen} 
        onClose={() => setIsAddSiteModalOpen(false)} 
      />
    </DashboardLayout>
  );
}
