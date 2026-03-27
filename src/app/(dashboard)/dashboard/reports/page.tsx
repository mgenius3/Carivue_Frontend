"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { SignalTrendChart } from "@/components/dashboard/SignalTrendChart";
import { Calendar, Download, RefreshCw } from "lucide-react";

const csiTrendData = [
  { name: "Week 1", csi: 55, mod: 58, csd: 40 },
  { name: "Week 2", csi: 62, mod: 65, csd: 42 },
  { name: "Week 3", csi: 75, mod: 72, csd: 45 },
  { name: "Week 4", csi: 78, mod: 70, csd: 35 },
  { name: "Week 5", csi: 70, mod: 75, csd: 30 },
  { name: "Week 6", csi: 38, mod: 40, csd: 35 },
];

const sparklineData = [
    { value: 10 }, { value: 15 }, { value: 8 }, { value: 12 }, { value: 20 }, { value: 18 }, { value: 25 }
];

const siteComparison = [
  { name: "Willowbrooks Care Home", sector: "Residential", csi: "58%", status: "Emerging Strain", statusColor: "text-[#C7791A]" },
  { name: "Riversides Residential Care", sector: "Domiciliary", csi: "27%", status: "Normal", statusColor: "text-green-500" },
  { name: "Oakwoods Supported Living", sector: "Supported Living", csi: "71%", status: "Escalating Strain", statusColor: "text-red-500" },
];

const submissionHistory = [
  { site: "Willowbrooks Care Home", unit: "Ground Floor", ending: "5/01/2026", user: "Theresa A.", time: "14:30" },
  { site: "Riversides Residential Care", unit: "First Floor", ending: "5/01/2026", user: "Theresa A.", time: "14:30" },
  { site: "Oakwoods Supported Living", unit: "Dementia Floor", ending: "5/01/2026", user: "Theresa A.", time: "14:30" },
];

export default function ReportsPage() {
  return (
    <DashboardLayout title="Executive Dashboard">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F3A4A] mb-1">Reports</h1>
            <p className="text-sm text-gray-400 font-medium max-w-2xl leading-relaxed">
              Structured summaries of organizational strain, signal drivers, and operational patterns for governance and review.
            </p>
          </div>
          
          <button className="bg-[#1F3A4A] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-colors shrink-0">
            Download Report
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end items-center gap-3">
            <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
              <Calendar size={14} className="text-gray-400" />
              Current Week
            </button>
            <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
              <RefreshCw size={14} className="text-gray-400" />
              Refresh
            </button>
        </div>

        {/* Metric Cards */}
        <div className="grid md:grid-cols-4 gap-6">
            <KpiCard title="Carivue Stability Index">
                <GaugeChart value={68} label="68%" status="Emerging Strain" size={140} strokeWidth={10} />
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

        {/* CSI Trend */}
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm h-[450px]">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-base font-bold text-[#1F3A4A]">Carivue Stability Index</h3>
                <div className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold text-gray-400">
                    <Calendar size={12} />
                    Last 6 Weeks
                </div>
            </div>
            <TrendChart data={csiTrendData} />
        </div>

        {/* Site Comparison Table */}
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
          <div className="mb-8">
            <h3 className="text-base font-bold text-[#1F3A4A] mb-1">Site Comparison</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">A quick overview of the latest user activities</p>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Site</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sector</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Carivue Stability Index</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {siteComparison.map((site, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{site.name}</td>
                  <td className="py-4 text-sm font-medium text-gray-400">{site.sector}</td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{site.csi}</td>
                  <td className={`py-4 text-sm font-bold ${site.statusColor}`}>{site.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signal Trend Chart */}
        <SignalTrendChart />

        {/* Submission History Table */}
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
          <div className="mb-8">
            <h3 className="text-base font-bold text-[#1F3A4A] mb-1">Submission History</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">A quick overview of the latest user activities</p>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Site</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Floor/Unit</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Week Ending</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted By</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissionHistory.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.site}</td>
                  <td className="py-4 text-sm font-medium text-gray-400">{item.unit}</td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.ending}</td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.user}</td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
