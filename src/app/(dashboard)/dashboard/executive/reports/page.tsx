"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { SignalTrendChart } from "@/components/dashboard/SignalTrendChart";
import { Calendar, Download, RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { downloadCsv } from "@/lib/export";
import { getRecentWeekEndingOptions } from "@/lib/reporting";
import { AddSiteModal } from "@/components/dashboard/modals/AddSiteModal";

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentWeekEnding = getRecentWeekEndingOptions(1)[0];
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [showCurrentWeekOnly, setShowCurrentWeekOnly] = useState(searchParams.get("view") === "current-week");
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      const [overview, sitesData, historyData] = await Promise.all([
        apiFetch<any>(`/dashboard/overview?t=${Date.now()}`, { token, cache: 'no-store' as RequestCache }),
        apiFetch<any>(`/dashboard/sites?t=${Date.now()}`, { token, cache: 'no-store' as RequestCache }),
        apiFetch<any>(`/signals/history?t=${Date.now()}`, { token, cache: 'no-store' as RequestCache })
      ]);

      setData(overview);
      setSites(sitesData.sites || sitesData); // Handle potential { sites: [] } or []
      setHistory(historyData.submissions || []);
    } catch (err) {
      console.error("Reports page fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const visibleHistory = showCurrentWeekOnly
    ? history.filter((item) => String(item.week_ending).slice(0, 10) === currentWeekEnding)
    : history;

  const handleExport = () => {
    if (!data) {
      return;
    }

    downloadCsv(
      "executive-report.csv",
      [
        {
          scope: "organisation",
          reporting_week: new Date(data.current.week_ending || currentWeekEnding).toLocaleDateString(),
          csi: data.current.csi,
          oai: data.current.oai,
          mod: data.current.mod_val,
          csd: data.current.csd,
          status: data.current.status,
        },
        ...sites.map((site) => ({
          scope: "site",
          site: site.name,
          csi: site.csi,
          status: site.status,
          dominant_layer: site.dominant_layer || "",
        })),
        ...visibleHistory.map((item) => ({
          scope: "submission",
          site: item.site_name,
          unit: item.unit_name,
          week_ending: new Date(item.week_ending).toLocaleDateString(),
          submitted_by: item.submitted_by,
          activity: item.activity_type || "Submitted",
          time: item.time,
        })),
      ]
    );
  };

  if (loading || !data) {
    return (
      <DashboardLayout title="Executive Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const statusMap: Record<string, string> = {
    stable: "Stable",
    emerging_strain: "Emerging Strain",
    escalating_strain: "Escalating Strain",
    critical: "Critical"
  };

  const statusColorMap: Record<string, string> = {
    stable: "text-green-500",
    emerging_strain: "text-[#C7791A]",
    escalating_strain: "text-red-500",
    critical: "text-red-700"
  };

  return (
    <DashboardLayout
      title="Executive Dashboard"
      primaryActionLabel="Add New Site"
      onPrimaryAction={() => setIsAddSiteModalOpen(true)}
    >
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F3A4A] mb-1">Reports</h1>
            <p className="text-sm text-gray-400 font-medium max-w-2xl leading-relaxed">
              Structured summaries of organizational strain, signal drivers, and operational patterns for governance and review.
            </p>
          </div>
          
          <button
            onClick={handleExport}
            className="bg-[#1F3A4A] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-colors shrink-0"
          >
            Download Report
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end items-center gap-3">
            <button
              onClick={() => setShowCurrentWeekOnly((current) => !current)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors ${
                showCurrentWeekOnly
                  ? "border border-[#1F3A4A] bg-[#1F3A4A] text-white"
                  : "border border-gray-100 bg-white text-[#1F3A4A] hover:bg-gray-50"
              }`}
            >
              <Calendar size={14} className={showCurrentWeekOnly ? "text-white" : "text-gray-400"} />
              {showCurrentWeekOnly ? "Showing Current Week" : "Current Week Only"}
            </button>
            <button 
              onClick={fetchData}
              className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={14} className="text-gray-400" />
              Refresh
            </button>
        </div>

        {/* Metric Cards */}
        <div className="grid md:grid-cols-4 gap-6">
            <KpiCard title="Carivue Stability Index">
                <GaugeChart 
                  value={parseFloat(data.current.csi)} 
                  label={`${data.current.csi}%`} 
                  status={statusMap[data.current.status] || "Stable"} 
                  size={140} 
                  strokeWidth={10} 
                />
            </KpiCard>
            <KpiCard 
                title="OAI Score" 
                status={parseFloat(data.current.oai) > 50 ? "Elevated" : "Normal"} 
                statusVariant={parseFloat(data.current.oai) > 50 ? "error" : "success"} 
                trend="" 
                data={data.trend.map((t: any) => ({ value: parseFloat(t.oai) }))}
                color="#EF4444"
            />
            <KpiCard 
                title="MOD Score" 
                status={parseFloat(data.current.mod_val) > 40 ? "Monitor" : "Stable"} 
                statusVariant={parseFloat(data.current.mod_val) > 40 ? "warning" : "success"} 
                trend="" 
                data={data.trend.map((t: any) => ({ value: parseFloat(t.mod_val) }))}
                color="#EAB308"
            />
            <KpiCard 
                title="CSD Score" 
                status={parseFloat(data.current.csd) > 30 ? "Review Required" : "Normal"} 
                statusVariant={parseFloat(data.current.csd) > 30 ? "warning" : "success"} 
                trend="" 
                data={data.trend.map((t: any) => ({ value: parseFloat(t.csd) }))}
                color="#22C55E"
            />
        </div>

        {/* CSI Trend */}
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm h-[450px]">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-base font-bold text-[#1F3A4A]">Carivue Stability Index Trend</h3>
                <div className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold text-gray-400">
                    <Calendar size={12} />
                    Last 6 Weeks
                </div>
            </div>
            <TrendChart data={data.trend.map((t: any) => ({
              name: new Date(t.week_ending).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              csi: parseFloat(t.csi),
              mod: parseFloat(t.mod_val),
              csd: parseFloat(t.csd)
            }))} variant="plain" />
        </div>

        {/* Site Comparison Table */}
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
          <div className="mb-8">
            <h3 className="text-base font-bold text-[#1F3A4A] mb-1">Site Comparison</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Aggregated stability metrics per site</p>
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
              {sites.map((site, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{site.name}</td>
                  <td className="py-4 text-sm font-medium text-gray-400">{site.site_type || 'N/A'}</td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{site.csi}%</td>
                  <td className={`py-4 text-sm font-bold ${statusColorMap[site.status] || 'text-gray-400'}`}>
                    {statusMap[site.status] || site.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Submission History Table */}
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
          <div className="mb-8">
            <h3 className="text-base font-bold text-[#1F3A4A] mb-1">Submission History</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Detailed log of recent signal submissions</p>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Site</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Floor/Unit</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Week Ending</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted By</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activity</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleHistory.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.site_name}</td>
                  <td className="py-4 text-sm font-medium text-gray-400">{item.unit_name}</td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">
                    {new Date(item.week_ending).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.submitted_by}</td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.activity_type || 'Submitted'}</td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.time}</td>
                </tr>
              ))}
              {visibleHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                    {showCurrentWeekOnly ? "No submissions found for the current reporting week" : "No submissions found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AddSiteModal
        isOpen={isAddSiteModalOpen}
        onClose={() => setIsAddSiteModalOpen(false)}
        onCreated={fetchData}
      />
    </DashboardLayout>
  );
}
