"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { apiFetch } from "@/lib/api";

export default function SitesPage() {
  const router = useRouter();
  const [activeSiteId, setActiveSiteId] = useState("all");
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<any[]>([]);
  const [siteDetail, setSiteDetail] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      if (activeSiteId === "all") {
        const data = await apiFetch<any>(`/dashboard/sites?t=${Date.now()}`, { 
          token,
          cache: 'no-store' as RequestCache
        });
        setSites(data.sites || data);
      } else {
        // Fetch specific site detail
        const [detail, trendData] = await Promise.all([
          apiFetch<any>(`/dashboard/sites/${activeSiteId}?t=${Date.now()}`, { 
            token,
            cache: 'no-store' as RequestCache
          }),
          apiFetch<any>(`/dashboard/sites/${activeSiteId}/trend?t=${Date.now()}`, { 
            token,
            cache: 'no-store' as RequestCache
          })
        ]);
        setSiteDetail(detail);
        setTrend(trendData.trend);
      }
    } catch (err) {
      console.error("Sites page fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSiteId]);

  if (loading) {
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
            sites={sites} // Now dynamic 
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
                    <span>{sites.length} Total Sites</span>
                    <span className="text-gray-200">|</span>
                    <span>{sites.filter(s => s.status !== 'stable').length} Sites in Strain</span>
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
                <button 
                  onClick={fetchData}
                  className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw size={14} className="text-gray-400" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {sites.map(site => (
                  <div key={site.id} className="bg-white p-10 rounded-3xl border border-gray-50 shadow-sm flex flex-col items-center text-center">
                    <h3 className="text-base font-bold text-[#1F3A4A] mb-1">{site.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold mb-8 tracking-wide uppercase">Carivue Stability Index (CSI)</p>
                    
                    <div className="mb-6">
                      <GaugeChart value={parseFloat(site.csi) || 0} label={`${site.csi || 0}%`} status={statusMap[site.status] || "Stable"} size={180} strokeWidth={14} />
                    </div>
                    
                    <p className="text-sm font-bold text-[#1F3A4A] mt-2 mb-8">
                      CSI Baseline: <span className="font-semibold">{site.csi}%</span>
                    </p>
                    
                    <button 
                      onClick={() => setActiveSiteId(site.id.toString())}
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
                <h2 className="text-xl font-bold text-[#1F3A4A] mb-1">{siteDetail?.name}</h2>
                <p className="text-xs text-gray-400 font-bold lowercase tracking-wide">{siteDetail?.units?.length} Units • Active Site Overview</p>
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
                <button 
                  onClick={fetchData}
                  className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw size={14} className="text-gray-400" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid md:grid-cols-4 gap-6">
                <KpiCard title="Carivue Stability Index (CSI)">
                    <GaugeChart 
                      value={parseFloat(siteDetail?.csi) || 0} 
                      label={`${siteDetail?.csi || 0}%`} 
                      status={statusMap[siteDetail?.status] || "Stable"} 
                      size={140} 
                      strokeWidth={10} 
                    />
                </KpiCard>
                <KpiCard 
                    title="OAI Score" 
                    status={parseFloat(siteDetail?.oai) > 50 ? "Elevated" : "Normal"} 
                    statusVariant={parseFloat(siteDetail?.oai) > 50 ? "error" : "success"} 
                    trend="" 
                    data={trend.map(t => ({ value: parseFloat(t.oai) || 0 }))}
                    color="#EF4444"
                />
                <KpiCard 
                    title="MOD Score" 
                    status={parseFloat(siteDetail?.mod_val) > 40 ? "Monitor" : "Stable"} 
                    statusVariant={parseFloat(siteDetail?.mod_val) > 40 ? "warning" : "success"} 
                    trend="" 
                    data={trend.map(t => ({ value: parseFloat(t.mod_val) || 0 }))}
                    color="#EAB308"
                />
                <KpiCard 
                    title="CSD Score" 
                    status={parseFloat(siteDetail?.csd) > 30 ? "Review Required" : "Normal"} 
                    statusVariant={parseFloat(siteDetail?.csd) > 30 ? "warning" : "success"} 
                    trend="" 
                    data={trend.map(t => ({ value: parseFloat(t.csd) || 0 }))}
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
                <TrendChart data={trend.map(t => ({
                  name: new Date(t.week_ending).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                  csi: parseFloat(t.csi) || 0,
                  mod: parseFloat(t.mod_val) || 0,
                  csd: parseFloat(t.csd) || 0
                }))} />
            </div>

            {/* Unit Overview */}
            <UnitOverview 
                units={siteDetail?.units?.map((u: any) => ({
                  id: u.id,
                  name: u.name,
                  strain: parseFloat(u.csi),
                  status: statusMap[u.status] || "Stable",
                  highlights: [
                    `${u.oai}% Operational Load`,
                    `${u.mod_val}% Managerial Overrides`,
                    `${u.csd}% Clinical Intensity`
                  ]
                })) || []} 
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
