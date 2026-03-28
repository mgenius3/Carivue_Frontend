"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { AddUnitModal } from "@/components/dashboard/modals/AddUnitModal";
import { Copy, Check, Calendar, Download, RefreshCw, AlertTriangle, Zap, Activity } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { downloadCsv } from "@/lib/export";

export default function ManagerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeUnitId, setActiveUnitId] = useState<number | null>(null);
  const [availableSites, setAvailableSites] = useState<any[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);

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

      const [siteData, trendData, submissionData] = await Promise.all([
        apiFetch<any>(`/dashboard/sites/${resolvedSiteId}?t=${Date.now()}`, { 
          token,
          cache: 'no-store' as RequestCache
        }),
        apiFetch<any>(`/dashboard/sites/${resolvedSiteId}/trend?t=${Date.now()}`, { 
          token,
          cache: 'no-store' as RequestCache
        }),
        apiFetch<any>(`/dashboard/sites/${resolvedSiteId}/signals?t=${Date.now()}`, { 
          token,
          cache: 'no-store' as RequestCache
        })
      ]);

      setSite(siteData);
      setTrend(trendData.trend);
      setSubmissions(submissionData.submissions);
      
      if (siteData.units && siteData.units.length > 0) {
        setActiveUnitId(siteData.units[0].id);
      }
    } catch (err: any) {
      console.error("Manager dashboard fetch error:", err);
      setSite(null);
      setError(err.message || "We couldn't load the manager dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSiteId]);

  const handleCopy = () => {
    if (!site) return;
    const scopedLink = activeUnitId
      ? `${window.location.origin}/signal-input?unit=${activeUnitId}`
      : `${window.location.origin}/signal-input`;
    navigator.clipboard.writeText(scopedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!site) {
      return;
    }

    downloadCsv(
      `${site.name.toLowerCase().replace(/\s+/g, "-")}-dashboard-summary.csv`,
      [
        {
          site: site.name,
          reporting_week: new Date(site.week_ending || Date.now()).toLocaleDateString(),
          csi: site.csi,
          oai: site.oai,
          mod: site.mod_val,
          csd: site.csd,
          status: site.status,
        },
        ...site.units.map((unit: any) => ({
          unit: unit.name,
          csi: unit.csi,
          oai: unit.oai,
          mod: unit.mod_val,
          csd: unit.csd,
          status: unit.status,
        })),
        ...submissions.map((item: any) => ({
          signal_status_unit: item.name,
          signal_status: item.status,
        })),
      ]
    );
  };

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
            <h2 className="text-2xl font-bold text-[#1F3A4A] mb-2">Manager Dashboard Unavailable</h2>
            <p className="text-sm text-gray-500 mb-6">{error || "This manager account does not have a site to display yet."}</p>
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

  const activeUnit = site.units.find((u: any) => u.id === activeUnitId) || site.units[0];

  const formattedTrend = trend.map((t: any) => ({
    name: new Date(t.week_ending).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    csi: parseFloat(t.csi) || 0,
    mod: parseFloat(t.mod_val) || 0,
    csd: parseFloat(t.csd) || 0
  }));

  const latestTrend = trend.length > 0 ? trend[trend.length - 1] : { oai: 0, mod_val: 0, csd: 0 };

  const statusVariantMap: Record<string, "success" | "warning" | "error" | "default"> = {
    stable: "success",
    emerging_strain: "warning",
    escalating_strain: "error",
    critical: "error"
  };

  const statusMap: Record<string, string> = {
    stable: "Stable",
    emerging_strain: "Emerging Strain",
    escalating_strain: "Escalating Strain",
    critical: "Critical"
  };

  return (
    <DashboardLayout
      title="Manager Dashboard"
      role="manager"
      primaryActionLabel="Add New Unit"
      onPrimaryAction={() => setIsAddUnitModalOpen(true)}
    >
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F3A4A] mb-1">{site.name}</h1>
            <p className="text-sm text-gray-400 font-medium">
              Reporting Period: {new Date(site.week_ending || Date.now()).toLocaleDateString()}
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
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-white border border-gray-100 px-5 py-3 rounded-xl text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-all active:scale-95 shrink-0"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}
              Copy Weekly Signal Input Link
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/manager/reports?view=current-week")}
            className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Calendar size={14} className="text-gray-400" /> Current Week
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Download size={14} className="text-gray-400" /> Export
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
              value={parseFloat(site.csi) || 0} 
              label={`${site.csi || 0}%`} 
              status={statusMap[site.status] || "Stable"} 
              size={140} 
              strokeWidth={10} 
            />
          </KpiCard>
          <KpiCard
            title="Overtime Amplification Index"
            status={parseFloat(latestTrend.oai) > 50 ? "Elevated" : "Normal"}
            statusVariant={parseFloat(latestTrend.oai) > 50 ? "error" : "success"}
            trend=""
            data={trend.map(t => ({ value: parseFloat(t.oai) || 0 }))}
            color="#EF4444"
          />
          <KpiCard
            title="Manual Override Density"
            status={parseFloat(latestTrend.mod_val) > 40 ? "Monitor" : "Stable"}
            statusVariant={parseFloat(latestTrend.mod_val) > 40 ? "warning" : "success"}
            trend=""
            data={trend.map(t => ({ value: parseFloat(t.mod_val) || 0 }))}
            color="#EAB308"
          />
          <KpiCard
            title="Clinical Stabilisation Density"
            status={parseFloat(latestTrend.csd) > 30 ? "Review Required" : "Normal"}
            statusVariant={parseFloat(latestTrend.csd) > 30 ? "warning" : "success"}
            trend=""
            data={trend.map(t => ({ value: parseFloat(t.csd) || 0 }))}
            color="#22C55E"
          />
        </div>

        {/* Site Strain Trend */}
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm h-[450px]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-base font-bold text-[#1F3A4A]">Site Strain Trend</h3>
            <div className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold text-gray-400">
              <Calendar size={12} /> Last 6 Weeks
            </div>
          </div>
          <TrendChart data={formattedTrend} variant="plain" />
        </div>

        {/* Unit Overview */}
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#1F3A4A] mb-1">Unit Overview</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Unit Stability Overview</p>
            </div>
          </div>

          {/* Unit Tabs */}
          <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
            {site.units.map((u: any) => (
              <button
                key={u.id}
                onClick={() => setActiveUnitId(u.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeUnitId === u.id
                    ? "bg-[#C7791A] text-white shadow-md"
                    : "bg-transparent text-gray-400 hover:bg-gray-50"
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>

          {/* Unit Detail */}
          {activeUnit && (
            <div className="grid md:grid-cols-2 gap-10 animate-in fade-in duration-500">
              <div className="flex flex-col items-center justify-center gap-4 bg-gray-50/50 rounded-3xl p-10">
                <GaugeChart 
                  value={parseFloat(activeUnit.csi) || 0} 
                  label={`${activeUnit.csi || 0}%`} 
                  status={statusMap[activeUnit.status] || "Stable"} 
                  size={180} 
                  strokeWidth={14} 
                />
                <p className="text-[10px] text-[#C7791A] font-bold">
                  {parseFloat(activeUnit.csi) > 60 ? "Above Site Baseline" : "Stable Baseline"}
                </p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#1F3A4A] mb-2">{activeUnit.name} Summary</h4>
                <p className="text-sm text-gray-400 font-medium mb-6 leading-relaxed">
                  Operational strain on {activeUnit.name} is {parseFloat(activeUnit.csi) >= 60 ? "increasing" : "stable"}, with a current index of {activeUnit.csi}%. 
                  Primary drivers relate to {activeUnit.oai > activeUnit.mod_val ? "overtime amplification" : "managerial overrides"}.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">OAI</p>
                    <p className="text-lg font-bold text-[#1F3A4A]">{activeUnit.oai}%</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">MOD</p>
                    <p className="text-lg font-bold text-[#1F3A4A]">{activeUnit.mod_val}%</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">CSD</p>
                    <p className="text-lg font-bold text-[#1F3A4A]">{activeUnit.csd}%</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push(`/dashboard/manager/unit?id=${activeUnit.id}`)}
                  className="mt-8 bg-[#1F3A4A] text-white px-8 py-3 rounded-xl text-xs font-bold shadow-lg hover:bg-[#2c4e62] transition-all"
                >
                  View Unit Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Areas for Operational Review & Weekly Signal Submission */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-[#1F3A4A] mb-1">Areas for Operational Review</h3>
            <p className="text-xs text-gray-400 font-medium mb-8">Based on recent strain patterns, review highlighted units.</p>
            <div className="space-y-6">
              {site.units.filter((u: any) => parseFloat(u.csi) > 60).map((u: any, i: number) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-red-50/50 rounded-xl border border-red-100/50">
                  <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    Stablisation effort is increasing for <strong>{u.name}</strong>. Escalation monitoring recommended.
                  </p>
                </div>
              ))}
              {site.units.filter((u: any) => parseFloat(u.csi) > 60).length === 0 && (
                <div className="flex items-start gap-4 p-4 bg-green-50/50 rounded-xl border border-green-100/50">
                  <Check size={20} className="text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    All units are within stable operating ranges this week.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-base font-bold text-[#1F3A4A] mb-1">Weekly Signal Submission</h3>
            <p className="text-xs text-gray-400 font-medium mb-8">Current Reporting Status (Next Sunday)</p>
            <div className="space-y-4">
              {submissions.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-none">
                  <p className="text-sm font-bold text-[#1F3A4A]">{item.name}</p>
                  <span className={`text-[10px] font-bold px-4 py-1.5 rounded-md uppercase tracking-wide ${
                    item.status === "Submitted" ? "bg-green-50 text-green-500" : "bg-orange-50 text-orange-500"
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AddUnitModal
        isOpen={isAddUnitModalOpen}
        onClose={() => setIsAddUnitModalOpen(false)}
        onCreated={fetchData}
        preferredSiteId={activeSiteId}
      />
    </DashboardLayout>
  );
}
