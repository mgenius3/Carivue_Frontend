"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { SitesOverview } from "@/components/dashboard/SitesOverview";
import { OperationalReview } from "@/components/dashboard/OperationalReview";
import { SignalSubmission } from "@/components/dashboard/SignalSubmission";
import { Calendar, Download, RefreshCw } from "lucide-react";
import { AddSiteModal } from "@/components/dashboard/modals/AddSiteModal";
import { AddOrgModal } from "@/components/dashboard/modals/AddOrgModal";
import { ScoreExplanationModal } from "@/components/dashboard/modals/ScoreExplanationModal";

// Mock data for charts
const trendData = [
  { name: "Week 1", csi: 75, mod: 55, csd: 40 },
  { name: "Week 2", csi: 74, mod: 10, csd: 30 },
  { name: "Week 3", csi: 5, mod: 15, csd: 10 },
  { name: "Week 4", csi: 92, mod: 85, csd: 8 },
  { name: "Week 5", csi: 55, mod: 58, csd: 35 },
  { name: "Week 6", csi: 5, mod: 8, csd: 10 },
];

const sparklineData = [
  { value: 10 }, { value: 15 }, { value: 8 }, { value: 12 }, { value: 20 }, { value: 18 }, { value: 25 }
];

const sparklineDataYellow = [
    { value: 5 }, { value: 8 }, { value: 12 }, { value: 10 }, { value: 15 }, { value: 22 }, { value: 28 }
];

const sparklineDataGreen = [
    { value: 20 }, { value: 18 }, { value: 22 }, { value: 25 }, { value: 20 }, { value: 15 }, { value: 10 }
];

const sitesData = [
  { 
    id: "1", 
    name: "Willowbrooks Care Home", 
    csi: 74, 
    status: "Escalating Strain", 
    layer: "OAI" 
  },
  { 
    id: "2", 
    name: "Riversides Residential Care", 
    csi: 66, 
    status: "Emerging Strain", 
    layer: "MOD" 
  },
  { 
    id: "3", 
    name: "Oakwoods Supported Living", 
    csi: 52, 
    status: "Stable", 
    layer: "Balanced" 
  },
];

export default function ExecutiveDashboard() {
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
  const [explanationModal, setExplanationModal] = useState<{ isOpen: boolean; type: "CSI" | "OAI" | "MOD" }>({
    isOpen: false,
    type: "CSI"
  });

  const openExplanation = (type: "CSI" | "OAI" | "MOD") => {
    setExplanationModal({ isOpen: true, type });
  };

  return (
    <DashboardLayout 
      title="Executive Dashboard" 
      onAddOrg={() => setIsAddOrgModalOpen(true)}
    >
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F3A4A]">Meridian Care Group</h1>
            <p className="text-sm text-gray-400 font-medium">Reporting Period: 18-24 March 2026</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
                onClick={() => setIsAddOrgModalOpen(true)}
                className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-semibold text-secondary shadow-sm hover:bg-gray-50 transition-colors"
            >
              Add Organisation
            </button>
            <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-semibold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
              <Calendar size={14} className="text-gray-400" />
              Current Week
            </button>
            <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-semibold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
              <Download size={14} className="text-gray-400" />
              Export
            </button>
            <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-semibold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
              <RefreshCw size={14} className="text-gray-400" />
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => openExplanation("CSI")} className="cursor-pointer">
            <KpiCard title="Carivue Stability Index">
              <GaugeChart value={68} label="68%" status="Emerging Strain" size={140} strokeWidth={10} />
            </KpiCard>
          </div>
          
          <div onClick={() => openExplanation("OAI")} className="cursor-pointer">
            <KpiCard 
                title="Overtime Amplification Index" 
                status="Elevated" 
                statusVariant="error" 
                trend="12%" 
                trendDirection="up"
                data={sparklineData}
                color="#EF4444"
            />
          </div>
          
          <div onClick={() => openExplanation("MOD")} className="cursor-pointer">
            <KpiCard 
                title="Manual Override Density" 
                status="Stable but rising" 
                statusVariant="warning" 
                trend="6%" 
                trendDirection="up"
                data={sparklineDataYellow}
                color="#EAB308"
            />
          </div>
          
          <KpiCard 
            title="Clinical Stabilisation Density" 
            status="Normal" 
            statusVariant="success" 
            trend="2%" 
            trendDirection="down"
            data={sparklineDataGreen}
            color="#22C55E"
          />
        </div>

        {/* trend Chart */}
        <TrendChart data={trendData} />

        {/* Sites Overview */}
        <div onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button')?.textContent?.includes('Add New Site')) {
                setIsAddSiteModalOpen(true);
            }
        }}>
            <SitesOverview sites={sitesData} />
        </div>

        {/* Bottom Section: Review & Submission */}
        <div className="grid lg:grid-cols-5 gap-8 mb-10">
          <div className="lg:col-span-3">
            <OperationalReview />
          </div>
          <div className="lg:col-span-2">
            <SignalSubmission />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddSiteModal isOpen={isAddSiteModalOpen} onClose={() => setIsAddSiteModalOpen(false)} />
      <AddOrgModal isOpen={isAddOrgModalOpen} onClose={() => setIsAddOrgModalOpen(false)} />
      <ScoreExplanationModal 
        isOpen={explanationModal.isOpen} 
        onClose={() => setExplanationModal({ ...explanationModal, isOpen: false })} 
        type={explanationModal.type} 
      />
    </DashboardLayout>
  );
}
