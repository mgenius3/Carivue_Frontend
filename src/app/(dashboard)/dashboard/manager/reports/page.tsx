"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { SignalTrendChart } from "@/components/dashboard/SignalTrendChart";
import { Calendar, Download, RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function ManagerReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [availableSites, setAvailableSites] = useState<any[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      const context = await apiFetch<any>(`/signals/context?t=${Date.now()}`, {
        token,
        cache: 'no-store' as RequestCache
      });

      if (context.scope !== "sites" || !context.assignments || context.assignments.length === 0) {
        setSite(null);
        setError("No site is available for this manager account yet.");
        setLoading(false);
        return;
      }

      setAvailableSites(context.assignments);
      const resolvedSiteId =
        activeSiteId && context.assignments.some((assignedSite: any) => Number(assignedSite.site_id) === activeSiteId)
          ? activeSiteId
          : Number(context.assignments[0].site_id);

      if (resolvedSiteId !== activeSiteId) {
        setActiveSiteId(resolvedSiteId);
      }

      const [siteData, trendData, historyData] = await Promise.all([
        apiFetch<any>(`/dashboard/sites/${resolvedSiteId}?t=${Date.now()}`, { 
          token,
          cache: 'no-store' as RequestCache
        }),
        apiFetch<any>(`/dashboard/sites/${resolvedSiteId}/trend?t=${Date.now()}`, { 
          token,
          cache: 'no-store' as RequestCache
        }),
        apiFetch<any>(`/signals/history?siteId=${resolvedSiteId}&t=${Date.now()}`, { 
          token,
          cache: 'no-store' as RequestCache
        })
      ]);

      setSite(siteData);
      setTrend(trendData.trend);
      setHistory(historyData.submissions || []);
    } catch (err) {
      console.error("Manager reports fetch error:", err);
      setSite(null);
      setError("We couldn't load the manager reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSiteId]);

  if (loading) {
    return (
      <DashboardLayout title="Manager Dashboard" role="manager">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!site) {
    return (
      <DashboardLayout title="Manager Dashboard" role="manager">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="max-w-md text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
            <h2 className="text-2xl font-bold text-[#1F3A4A] mb-2">Reports Unavailable</h2>
            <p className="text-sm text-gray-500 mb-6">{error || "This manager account does not have a site to report on yet."}</p>
            <button
              onClick={() => router.push("/dashboard/manager/settings")}
              className="bg-[#1F3A4A] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-all"
            >
              Open Settings
            </button>
          </div>
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

  return (
    <DashboardLayout title="Manager Dashboard" role="manager">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F3A4A] mb-1">Reports</h1>
            <p className="text-sm text-gray-400 font-medium max-w-2xl leading-relaxed">
              Structured summaries of organisational strain, signal drivers, and operational patterns for {site.name}.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-3 shrink-0">
            {availableSites.length > 1 && (
              <select
                value={activeSiteId || undefined}
                onChange={(e) => setActiveSiteId(Number(e.target.value))}
                className="bg-white border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold text-[#1F3A4A] shadow-sm focus:outline-none"
              >
                {availableSites.map((assignedSite: any) => (
                  <option key={assignedSite.site_id} value={assignedSite.site_id}>
                    {assignedSite.site_name}
                  </option>
                ))}
              </select>
            )}
            <button className="bg-[#1F3A4A] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-colors shrink-0">
              Download Report
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
            <Calendar size={14} className="text-gray-400" /> Current Week
          </button>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} className="text-gray-400" /> Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <KpiCard title="Carivue Stability Index">
            <GaugeChart 
              value={parseFloat(site.csi)} 
              label={`${site.csi}%`} 
              status={statusMap[site.status] || "Stable"} 
              size={140} 
              strokeWidth={10} 
            />
          </KpiCard>
          <KpiCard 
            title="OAI Score" 
            status={parseFloat(site.oai) > 50 ? "Elevated" : "Normal"} 
            statusVariant={parseFloat(site.oai) > 50 ? "error" : "success"} 
            trend="" 
            data={trend.map(t => ({ value: parseFloat(t.oai) }))} 
            color="#EF4444" 
          />
          <KpiCard 
            title="MOD Score" 
            status={parseFloat(site.mod_val) > 40 ? "Monitor" : "Stable"} 
            statusVariant={parseFloat(site.mod_val) > 40 ? "warning" : "success"} 
            trend="" 
            data={trend.map(t => ({ value: parseFloat(t.mod_val) }))} 
            color="#EAB308" 
          />
          <KpiCard 
            title="CSD Score" 
            status={parseFloat(site.csd) > 30 ? "Review Required" : "Normal"} 
            statusVariant={parseFloat(site.csd) > 30 ? "warning" : "success"} 
            trend="" 
            data={trend.map(t => ({ value: parseFloat(t.csd) }))} 
            color="#22C55E" 
          />
        </div>

        {/* CSI Trend */}
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm h-[450px]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-base font-bold text-[#1F3A4A]">Carivue Stability Index</h3>
            <div className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold text-gray-400">
              <Calendar size={12} /> Last 6 Weeks
            </div>
          </div>
          <TrendChart data={trend.map(t => ({
            name: new Date(t.week_ending).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            csi: parseFloat(t.csi),
            mod: parseFloat(t.mod_val),
            csd: parseFloat(t.csd)
          }))} />
        </div>

        {/* Submission History */}
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
          <div className="mb-8">
            <h3 className="text-base font-bold text-[#1F3A4A] mb-1">Submission History</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">A quick overview of your submission activities</p>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Floor/Unit</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Week Ending</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted By</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.unit_name}</td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">
                    {new Date(item.week_ending).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.submitted_by}</td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.time}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-gray-400">No submissions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
