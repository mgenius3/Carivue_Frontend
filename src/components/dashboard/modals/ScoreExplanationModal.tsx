"use client";

import React from "react";
import { Info, TrendingUp, Layers, HelpCircle, LucideIcon } from "lucide-react";

interface BaselineItem {
  label: string;
  value: string;
  highlight?: "error" | "warning";
}

interface ScoreData {
  title: string;
  description: string;
  value: string;
  status: string;
  statusVariant: "success" | "warning" | "error" | "info" | "neutral";
  trend: string;
  baselineData: BaselineItem[];
  sectionTitle: string;
  sectionIcon: LucideIcon;
  sectionText?: string;
  secondaryData?: { label: string; value: string }[];
}

interface ScoreExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "CSI" | "OAI" | "MOD" | "CSD";
}

const content: Record<"CSI" | "OAI" | "MOD" | "CSD", ScoreData> = {
  CSI: {
    title: "Carivue Stability Index (CSI)",
    description: "Represents the overall level of operational strain within a service by measuring deviations in stabilisation effort from the service's normal operating baseline.",
    value: "68%",
    status: "Emerging Strain",
    statusVariant: "warning",
    trend: "12%",
    baselineData: [
      { label: "Baseline (6-Weeks Equilibrium)", value: "52%" },
      { label: "Expected Operating Range", value: "45% - 60%" },
      { label: "Current Position", value: "+16%", highlight: "error" },
    ],
    sectionTitle: "Strain Direction",
    sectionIcon: TrendingUp,
    sectionText: "Current trajectory indicates continued upward pressure if current patterns persist."
  },
  OAI: {
    title: "Overtime Amplification Index (OAI)",
    description: "This is the degree to which workforce capacity is being artificially extended to sustain operational output.",
    value: "214 extra shifts",
    status: "Elevated",
    statusVariant: "error",
    trend: "12%",
    baselineData: [
      { label: "Baseline (6-Weeks Equilibrium)", value: "163 Shifts" },
      { label: "Baseline Tolerance Range", value: "155 - 171 shifts" },
      { label: "Current Position", value: "+43 above Baseline", highlight: "error" },
    ],
    sectionTitle: "Operational Drivers (This Period)",
    secondaryData: [
        { label: "Last-minute absences", value: "6" },
        { label: "Extra shifts worked", value: "12" },
        { label: "Rota reallocations", value: "5" },
        { label: "Unauthorized absences", value: "1" },
    ],
    sectionIcon: Layers,
  },
  MOD: {
    title: "Manual Override Density (MOD)",
    description: "MOD measures supervisory and managerial intervention to maintain operational stability.",
    value: "33 Interventions",
    status: "Stable but rising",
    statusVariant: "warning",
    trend: "12%",
    baselineData: [
      { label: "Baseline (6-Weeks Equilibrium)", value: "29" },
      { label: "Baseline Tolerance Range", value: "24 - 35" },
      { label: "Current Position", value: "+4 with Baseline", highlight: "warning" },
    ],
    sectionTitle: "Interpretation",
    sectionIcon: HelpCircle,
    sectionText: "Managerial effort is increasing gradually but remains within the target range."
  },
  CSD: {
    title: "Clinical Stabilisation Density (CSD)",
    description: "CSD reflects the level of active clinical oversight and resident stabilisation effort needed to maintain safe delivery.",
    value: "18 Clinical Events",
    status: "Monitor",
    statusVariant: "warning",
    trend: "8%",
    baselineData: [
      { label: "Baseline (6-Weeks Equilibrium)", value: "14" },
      { label: "Baseline Tolerance Range", value: "10 - 17" },
      { label: "Current Position", value: "+4 above Baseline", highlight: "warning" },
    ],
    sectionTitle: "Clinical Drivers (This Period)",
    secondaryData: [
      { label: "Clinical monitoring cases", value: "7" },
      { label: "Health deterioration events", value: "4" },
      { label: "Hospital admissions", value: "2" },
      { label: "Increased observations", value: "5" },
    ],
    sectionIcon: Layers,
  }
};

export function ScoreExplanationModal({ isOpen, onClose, type = "CSI" }: ScoreExplanationModalProps) {
  const data = content[type];
  const Icon = data.sectionIcon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000000]/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="px-8 py-8">
          <h2 className="text-xl font-bold text-[#1F3A4A] mb-2">{data.title}</h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">{data.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-bold text-[#1F3A4A]">{data.value}</span>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wide flex items-center gap-1 ${
              data.statusVariant === "warning" ? "bg-[#FFF8F1] text-[#C7791A]" : "bg-[#FEE2E2] text-red-600"
            }`}>
              <Info size={12} />
              {data.status}
            </span>
          </div>

          <div className="flex items-center gap-1 mb-8">
            <TrendingUp size={14} className="text-red-500" />
            <span className="text-[10px] font-bold text-red-500 uppercase">{data.trend}</span>
            <span className="text-[10px] font-medium text-gray-400 uppercase"> from last week</span>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-sm font-bold text-[#1F3A4A]">Baseline Reference</p>
            {data.baselineData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium">{item.label}</span>
                <span className={`font-bold ${
                    item.highlight === "error" ? "text-red-500" : 
                    item.highlight === "warning" ? "text-secondary" : 
                    "text-[#1F3A4A]"
                }`}>
                    {item.value}
                </span>
              </div>
            ))}
          </div>

          {data.secondaryData && (
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-[#FFF8F1] p-1.5 rounded-md">
                        <Icon size={14} className="text-secondary" />
                    </div>
                    <p className="text-sm font-bold text-[#1F3A4A]">{data.sectionTitle}</p>
                </div>
                {data.secondaryData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">{item.label}</span>
                        <span className="font-bold text-[#1F3A4A]">{item.value}</span>
                    </div>
                ))}
              </div>
          )}

          {data.sectionText && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-[#FFF8F1] p-1.5 rounded-md">
                    <Icon size={14} className="text-secondary" />
                </div>
                <p className="text-sm font-bold text-[#1F3A4A]">{data.sectionTitle}</p>
              </div>
              <p className="text-[13px] text-gray-500 leading-relaxed font-medium">{data.sectionText}</p>
            </div>
          )}

          <button 
            onClick={onClose}
            className="w-full mt-8 py-3 rounded-xl text-sm font-bold text-white bg-[#1F3A4A] hover:bg-[#2c4e62] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
