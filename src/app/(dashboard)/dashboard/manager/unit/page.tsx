"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { StrainDistributionChart } from "@/components/dashboard/StrainDistributionChart";
import { Plus, Calendar, Download, RefreshCw, AlertTriangle, Zap, Activity } from "lucide-react";
import { apiFetch } from "@/lib/api";

function UnitDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unitIdParam = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("All Units");
  const [unitTrend, setUnitTrend] = useState<any[]>([]);
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

      const siteData = await apiFetch<any>(`/dashboard/sites/${resolvedSiteId}?t=${Date.now()}`, { 
        token,
        cache: 'no-store' as RequestCache
      });
      setSite(siteData);
      setActiveTab("All Units");
      setUnitTrend([]);

      // Handle initial tab selection from query param
      if (unitIdParam) {
        const foundUnit = siteData.units.find((u: any) => u.id === parseInt(unitIdParam));
        if (foundUnit) {
          setActiveTab(foundUnit.name);
          fetchUnitTrend(foundUnit.id, resolvedSiteId, token);
        }
      }
    } catch (err: any) {
      console.error("Unit page fetch error:", err);
      setSite(null);
      setError(err.message || "We couldn't load the unit view.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitTrend = async (unitId: number, siteId: number, token: string) => {
    try {
      const trendData = await apiFetch<any>(`/dashboard/units/${unitId}/trend?t=${Date.now()}`, { 
        token,
        cache: 'no-store' as RequestCache
      });
      setUnitTrend(trendData.trend);
    } catch (err) {
      console.error("Unit trend error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSiteId, unitIdParam]);

  const isAllUnits = activeTab === "All Units";
  const selectedUnit = site?.units.find((u: any) => u.name === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="max-w-md text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-10">
          <h2 className="text-2xl font-bold text-[#1F3A4A] mb-2">Unit View Unavailable</h2>
          <p className="text-sm text-gray-500 mb-6">{error || "This manager account does not have a site to display yet."}</p>
          <button
            onClick={() => router.push("/dashboard/manager/settings")}
            className="bg-[#1F3A4A] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-all"
          >
            Open Settings
          </button>
        </div>
      </div>
    );
  }

  const unitTabs = ["All Units", ...site.units.map((u: any) => u.name)];

  const statusMap: Record<string, string> = {
    stable: "Stable",
    emerging_strain: "Emerging Strain",
    escalating_strain: "Escalating Strain",
    critical: "Critical"
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3A4A] mb-1">{isAllUnits ? "Unit Overview" : site.name}</h1>
          <p className="text-sm text-gray-400 font-medium">{isAllUnits ? "Overview of operational strain across all units" : `Detailed view for ${activeTab}`}</p>
        </div>
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
      </div>

      {/* Unit Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {unitTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === "All Units") {
                setUnitTrend([]);
              }
            }}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab
                ? "bg-[#C7791A] text-white shadow-md"
                : "bg-transparent text-gray-400 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isAllUnits ? (
        /* All Units View */
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#1F3A4A] mb-1">Site Units Summary</h2>
              <p className="text-sm text-gray-400 font-medium">
                {site.units.length} Total Units • {site.units.filter((u: any) => parseFloat(u.csi) > 60).length} units in Strain
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchData} className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
                <RefreshCw size={14} className="text-gray-400" /> Refresh
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {site.units.map((unit: any) => (
              <div key={unit.id} className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center gap-6">
                <h3 className="text-base font-bold text-[#1F3A4A]">{unit.name}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Carivue Stability Index (CSI)</p>
                <GaugeChart 
                  value={parseFloat(unit.csi) || 0} 
                  label={`${unit.csi || 0}%`} 
                  status={statusMap[unit.status] || "Stable"} 
                  size={160} 
                  strokeWidth={12} 
                />
                <p className="text-[10px] text-gray-400 font-bold uppercase">Dominant: {unit.oai > unit.mod_val ? "OAI" : "MOD"}</p>
                <button
                  onClick={() => {
                    setActiveTab(unit.name);
                    const token = localStorage.getItem("token");
                    if (token) {
                      fetchUnitTrend(unit.id, site.id, token);
                    }
                  }}
                  className="bg-[#1F3A4A] text-white px-6 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-[#2c4e62] transition-colors"
                >
                  View More Details
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Specific Unit View */
        selectedUnit && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#1F3A4A] mb-1">{selectedUnit.name}</h2>
                <p className="text-sm text-gray-400 font-medium">Reporting Period: {new Date(selectedUnit.week_ending).toLocaleDateString()}</p>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <KpiCard title="Carivue Stability Index (CSI)">
                <GaugeChart 
                  value={parseFloat(selectedUnit.csi) || 0} 
                  label={`${selectedUnit.csi || 0}%`} 
                  status={statusMap[selectedUnit.status] || "Stable"} 
                  size={140} 
                  strokeWidth={10} 
                />
              </KpiCard>
              <KpiCard 
                title="OAI Score" 
                status={selectedUnit.oai > 50 ? "Elevated" : "Stable"} 
                statusVariant={selectedUnit.oai > 50 ? "error" : "success"} 
                trend="" 
                data={unitTrend.map(t => ({ value: parseFloat(t.oai) || 0 }))} 
                color="#EF4444" 
              />
              <KpiCard 
                title="MOD Score" 
                status={selectedUnit.mod_val > 40 ? "Monitor" : "Stable"} 
                statusVariant={selectedUnit.mod_val > 40 ? "warning" : "success"} 
                trend="" 
                data={unitTrend.map(t => ({ value: parseFloat(t.mod_val) || 0 }))} 
                color="#EAB308" 
              />
              <KpiCard 
                title="CSD Score" 
                status={selectedUnit.csd > 30 ? "Review" : "Normal"} 
                statusVariant={selectedUnit.csd > 30 ? "warning" : "success"} 
                trend="" 
                data={unitTrend.map(t => ({ value: parseFloat(t.csd) || 0 }))} 
                color="#22C55E" 
              />
            </div>

            {/* Unit Strain Trend placeholder */}
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm h-[400px] mb-8">
              <h3 className="text-base font-bold text-[#1F3A4A] mb-8">Unit Strain Trend (6 Weeks)</h3>
              <TrendChart data={unitTrend.map(t => ({
                name: new Date(t.week_ending).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                csi: parseFloat(t.csi) || 0,
                mod: parseFloat(t.mod_val) || 0,
                csd: parseFloat(t.csd) || 0
              }))} />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-base font-bold text-[#1F3A4A] mb-4">Operational Insights</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 font-medium">
                      The strain for <strong>{selectedUnit.name}</strong> is currently <strong>{statusMap[selectedUnit.status]}</strong>. 
                      The primary driver is {selectedUnit.oai > selectedUnit.mod_val ? "Operational Load (OAI)" : "Managerial Stabilisation (MOD)"}.
                    </p>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                    <Activity size={20} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                      Recommended Action: {selectedUnit.oai >= selectedUnit.mod_val && selectedUnit.oai >= selectedUnit.csd
                        ? "Review shift allocations, overtime reliance, and cover arrangements."
                        : selectedUnit.mod_val >= selectedUnit.csd
                          ? "Review manual workarounds, escalation patterns, and manager intervention load."
                          : "Review clinical observations, resident acuity changes, and safeguarding pressure."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-base font-bold text-[#1F3A4A] mb-6 text-center">Strain Distribution</h3>
                <StrainDistributionChart
                  data={[
                    { name: "Operational Load", value: Number(selectedUnit.oai), color: "#C7791A" },
                    { name: "Managerial Effort", value: Number(selectedUnit.mod_val), color: "#1F3A4A" },
                    { name: "Clinical Load", value: Number(selectedUnit.csd), color: "#D1D5DB" },
                  ]}
                />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default function ManagerUnitPage() {
  return (
    <DashboardLayout title="Manager Dashboard" role="manager">
      <Suspense fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <UnitDashboardContent />
      </Suspense>
    </DashboardLayout>
  );
}
