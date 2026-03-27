"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { apiFetch } from "@/lib/api";

export default function ExecutiveDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
  const [explanationModal, setExplanationModal] = useState<{ isOpen: boolean; type: "CSI" | "OAI" | "MOD" | "CSD" }>({
    isOpen: false,
    type: "CSI"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      const [overviewData, sitesData, historyData] = await Promise.all([
        apiFetch<any>(`/dashboard/overview?t=${Date.now()}`, { 
          token,
          cache: 'no-store' as RequestCache 
        }),
        apiFetch<any>(`/dashboard/sites?t=${Date.now()}`, { 
          token,
          cache: 'no-store' as RequestCache 
        }),
        apiFetch<any>(`/signals/history?t=${Date.now()}`, {
          token,
          cache: 'no-store' as RequestCache
        })
      ]);

      setOverview(overviewData);
      setSites(sitesData.sites);
      setHistory(historyData.submissions || []);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const openExplanation = (type: "CSI" | "OAI" | "MOD" | "CSD") => {
    setExplanationModal({ isOpen: true, type });
  };

  if (loading || !overview) {
    return (
      <DashboardLayout title="Executive Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const { current, trend } = overview;

  // Format trend data for TrendChart
  const formattedTrend = trend.map((t: any) => ({
    name: new Date(t.week_ending).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    csi: parseFloat(t.csi),
    mod: parseFloat(t.mod_val),
    csd: parseFloat(t.csd)
  }));

  // Sparkline placeholders for now (could be derived from trend)
  const oaiTrend = trend.map((t: any) => ({ value: parseFloat(t.oai) }));
  const modTrend = trend.map((t: any) => ({ value: parseFloat(t.mod_val) }));
  const csdTrend = trend.map((t: any) => ({ value: parseFloat(t.csd) }));

  const statusMap: Record<string, string> = {
    stable: "Stable",
    emerging_strain: "Emerging Strain",
    escalating_strain: "Escalating Strain",
    critical: "Critical"
  };

  const statusVariantMap: Record<string, "success" | "warning" | "error" | "neutral"> = {
    stable: "success",
    emerging_strain: "warning",
    escalating_strain: "error",
    critical: "error"
  };

  const reviewItems = sites
    .filter((site) => site.status !== "stable")
    .sort((a, b) => Number(b.csi) - Number(a.csi))
    .slice(0, 3)
    .map((site) => ({
      text: `${site.name} is showing ${statusMap[site.status]?.toLowerCase() || "heightened"} strain. Dominant pressure is ${site.dominant_layer || "mixed"}.`,
    }));

  const recentSubmissionItems = history.slice(0, 5).map((item: any) => ({
    name: `${item.site_name} - ${item.unit_name}`,
    status: "Submitted",
    variant: "success" as const,
    detail: `${new Date(item.week_ending).toLocaleDateString()} at ${item.time} by ${item.submitted_by}`,
  }));

  return (
    <DashboardLayout 
      title="Executive Dashboard" 
      onAddOrg={() => setIsAddOrgModalOpen(true)}
    >
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F3A4A]">Executive Dashboard</h1>
            <p className="text-sm text-gray-400 font-medium">
              Reporting Period: {new Date(current.week_ending).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-semibold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
              <Calendar size={14} className="text-gray-400" />
              Current Week
            </button>
            <button className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-semibold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors">
              <Download size={14} className="text-gray-400" />
              Export
            </button>
            <button 
              onClick={fetchData}
              className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-lg text-xs font-semibold text-[#1F3A4A] shadow-sm hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={14} className="text-gray-400" />
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => openExplanation("CSI")} className="cursor-pointer">
            <KpiCard title="Carivue Stability Index">
              <GaugeChart 
                value={parseFloat(current.csi)} 
                label={`${current.csi}%`} 
                status={statusMap[current.status] || "Stable"} 
                size={140} 
                strokeWidth={10} 
              />
            </KpiCard>
          </div>
          
          <div onClick={() => openExplanation("OAI")} className="cursor-pointer">
            <KpiCard 
                title="Overtime Amplification Index" 
                status={statusMap[current.status] || "Stable"} 
                statusVariant={statusVariantMap[current.status]} 
                trend={current.oai > 50 ? "high" : "low"} 
                trendDirection={current.oai > 50 ? "up" : "down"}
                data={oaiTrend}
                color="#EF4444"
            />
          </div>
          
          <div onClick={() => openExplanation("MOD")} className="cursor-pointer">
            <KpiCard 
                title="Manual Override Density" 
                status={current.mod_val > 40 ? "Elevated" : "Normal"} 
                statusVariant={current.mod_val > 40 ? "warning" : "success"} 
                trend="" 
                data={modTrend}
                color="#EAB308"
            />
          </div>
          
          <div onClick={() => openExplanation("CSD")} className="cursor-pointer">
            <KpiCard 
                title="Clinical Stabilisation Density" 
                status={current.csd > 30 ? "Monitor" : "Stable"} 
                statusVariant={current.csd > 30 ? "warning" : "success"} 
                trend="" 
                data={csdTrend}
                color="#22C55E"
            />
          </div>
        </div>

        {/* trend Chart */}
        <TrendChart data={formattedTrend} title="Organisation Strain Trend" />

        {/* Sites Overview */}
        <div onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button')?.textContent?.includes('Add New Site')) {
                setIsAddSiteModalOpen(true);
            }
        }}>
            <SitesOverview sites={sites.map(s => ({
                ...s,
                layer: s.dominant_layer || "Balanced",
                status: statusMap[s.status] || "Stable"
            }))} />
        </div>

        {/* Bottom Section: Review & Submission */}
        <div className="grid lg:grid-cols-5 gap-8 mb-10">
          <div className="lg:col-span-3">
            <OperationalReview items={reviewItems} />
          </div>
          <div className="lg:col-span-2">
            <SignalSubmission items={recentSubmissionItems} />
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
