"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { SignalTrendChart } from "@/components/dashboard/SignalTrendChart";
import { Modal } from "@/components/dashboard/modals/Modal";
import { AddUnitModal } from "@/components/dashboard/modals/AddUnitModal";
import { Calendar, Download, Eye, RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { downloadCsv } from "@/lib/export";
import { getRecentWeekEndingOptions } from "@/lib/reporting";

interface SubmissionDetail {
  id: number;
  site_name: string;
  unit_name: string;
  week_ending: string;
  created_at: string;
  oai_sickness_absences: number;
  oai_shift_reallocations: number;
  oai_additional_shifts: number;
  oai_unauthorized_absences: number;
  oai_staff_removed: number;
  mod_manager_intervention: number;
  mod_record_correction: number;
  mod_internal_safeguarding: number;
  mod_supervisory_oversight: number;
  csd_clinical_monitoring: number;
  csd_health_deterioration: number;
  csd_hospital_admissions: number;
  csd_safeguarding_concerns: number;
  csd_increased_observations: number;
}

const detailSections = [
  {
    title: "Operational Load (OAI)",
    fields: [
      { key: "oai_sickness_absences", label: "Was there any last-minute sickness or absence affecting scheduled shifts?", helperText: "Number of shifts or visits affected" },
      { key: "oai_shift_reallocations", label: "Did you rearrange shifts due to short-notice absence?", helperText: "Number of reallocations" },
      { key: "oai_additional_shifts", label: "Did staff work additional shifts beyond their planned rota?", helperText: "Additional shifts worked" },
      { key: "oai_unauthorized_absences", label: "Was there any unauthorized absence this week?", helperText: "Number of incidents" },
      { key: "oai_staff_removed", label: "Was any staff member asked to step away from duty due to misconduct or unsafe practice?", helperText: "Number of instances" },
    ],
  },
  {
    title: "Managerial Stabilisation (MOD)",
    fields: [
      { key: "mod_manager_intervention", label: "Did a manager or senior step in to complete tasks originally assigned to care staff?", helperText: "Number of instances" },
      { key: "mod_record_correction", label: "Were care records corrected or rewritten due to errors or omissions?", helperText: "Number of issues resolved" },
      { key: "mod_internal_safeguarding", label: "Were safeguarding or complaint concerns managed internally without external referral?", helperText: "Number of cases" },
      { key: "mod_supervisory_oversight", label: "Did supervisors need to repeat instructions or closely monitor staff due to performance concerns?", helperText: "Number of instances" },
    ],
  },
  {
    title: "Clinical Stabilisation (CSD)",
    fields: [
      { key: "csd_clinical_monitoring", label: "How many residents are currently under active clinical monitoring this week?", helperText: "Number of residents" },
      { key: "csd_health_deterioration", label: "Was there any new or worsening health deterioration requiring intervention this week?", helperText: "Number of residents" },
      { key: "csd_hospital_admissions", label: "Were any residents admitted to hospital due to a new or worsening condition?", helperText: "Number of admissions" },
      { key: "csd_safeguarding_concerns", label: "Were there safeguarding concerns requiring formal external reporting?", helperText: "Number of cases" },
      { key: "csd_increased_observations", label: "Did any resident require increased observations beyond their usual care plan?", helperText: "Number of residents" },
    ],
  },
] as const;

export default function ManagerReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentWeekEnding = getRecentWeekEndingOptions(1)[0];
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [availableSites, setAvailableSites] = useState<any[]>([]);
  const [activeSiteId, setActiveSiteId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [showCurrentWeekOnly, setShowCurrentWeekOnly] = useState(searchParams.get("view") === "current-week");
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

  const visibleHistory = showCurrentWeekOnly
    ? history.filter((item) => String(item.week_ending).slice(0, 10) === currentWeekEnding)
    : history;

  const handleExport = () => {
    if (!site) {
      return;
    }

    downloadCsv(
      `${site.name.toLowerCase().replace(/\s+/g, "-")}-manager-report.csv`,
      [
        {
          site: site.name,
          reporting_week: new Date(site.week_ending || currentWeekEnding).toLocaleDateString(),
          csi: site.csi,
          oai: site.oai,
          mod: site.mod_val,
          csd: site.csd,
          status: site.status,
        },
        ...visibleHistory.map((item) => ({
          site: site.name,
          unit: item.unit_name,
          week_ending: new Date(item.week_ending).toLocaleDateString(),
          submitted_by: item.submitted_by,
          activity: item.activity_type || "Submitted",
          time: item.time,
        })),
      ]
    );
  };

  const openSubmissionDetail = async (submissionId: number) => {
    setDetailLoading(true);
    setDetailError("");
    setIsDetailOpen(true);
    setSelectedSubmission(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const submission = await apiFetch<SubmissionDetail>(`/signals/${submissionId}`, {
        token,
        cache: "no-store" as RequestCache,
      });

      setSelectedSubmission(submission);
    } catch (err: any) {
      setDetailError(err.message || "We couldn't load this submission.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeSubmissionDetail = () => {
    setIsDetailOpen(false);
    setDetailError("");
    setSelectedSubmission(null);
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
    <DashboardLayout
      title="Manager Dashboard"
      role="manager"
      primaryActionLabel="Add New Unit"
      onPrimaryAction={() => setIsAddUnitModalOpen(true)}
    >
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
            <button
              onClick={handleExport}
              className="bg-[#1F3A4A] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-colors shrink-0"
            >
              Download Report
            </button>
          </div>
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
            <Calendar size={14} className={showCurrentWeekOnly ? "text-white" : "text-gray-400"} /> {showCurrentWeekOnly ? "Showing Current Week" : "Current Week Only"}
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
          }))} variant="plain" />
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
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activity</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</th>
                <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleHistory.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.unit_name}</td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">
                    {new Date(item.week_ending).toLocaleDateString()}
                  </td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.submitted_by}</td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.activity_type || 'Submitted'}</td>
                  <td className="py-4 text-sm font-bold text-[#1F3A4A]">{item.time}</td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => openSubmissionDetail(Number(item.id))}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-100 px-4 py-2 text-xs font-bold text-[#1F3A4A] shadow-sm transition-colors hover:bg-gray-50"
                    >
                      <Eye size={14} className="text-gray-400" />
                      View Details
                    </button>
                  </td>
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

      <Modal
        isOpen={isDetailOpen}
        onClose={closeSubmissionDetail}
        title="Submission Details"
        size="xl"
      >
        {detailLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : detailError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {detailError}
          </div>
        ) : selectedSubmission ? (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Site</p>
                <p className="mt-2 text-sm font-bold text-[#1F3A4A]">{selectedSubmission.site_name}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Unit</p>
                <p className="mt-2 text-sm font-bold text-[#1F3A4A]">{selectedSubmission.unit_name}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Week Ending</p>
                <p className="mt-2 text-sm font-bold text-[#1F3A4A]">
                  {new Date(selectedSubmission.week_ending).toLocaleDateString()}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Submitted At</p>
                <p className="mt-2 text-sm font-bold text-[#1F3A4A]">
                  {new Date(selectedSubmission.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {detailSections.map((section) => (
                <div key={section.title} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-5 text-base font-bold text-[#1F3A4A]">{section.title}</h3>
                  <div className="space-y-3">
                    {section.fields.map((field) => {
                      const value = Number(selectedSubmission[field.key as keyof SubmissionDetail] || 0);
                      const hasSignal = value > 0;
                      return (
                        <div
                          key={field.key}
                          className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4"
                        >
                          <p className="text-sm font-medium text-gray-500">
                            {field.label}{" "}
                            <span className="font-bold text-primary">
                              {hasSignal ? "YES" : "NO"}
                            </span>
                          </p>
                          {hasSignal && (
                            <div className="mt-3 border-t border-gray-200 pt-3">
                              <p className="text-sm font-medium text-gray-500">
                                {field.helperText} :{" "}
                                <span className="font-bold text-[#1F3A4A]">{value}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm font-medium text-gray-500">
            No submission details are available yet.
          </div>
        )}
      </Modal>
      <AddUnitModal
        isOpen={isAddUnitModalOpen}
        onClose={() => setIsAddUnitModalOpen(false)}
        onCreated={fetchData}
        preferredSiteId={activeSiteId}
      />
    </DashboardLayout>
  );
}
