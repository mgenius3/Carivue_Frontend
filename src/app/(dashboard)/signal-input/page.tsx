"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProgressBar } from './components/ProgressBar';
import { OaiStep } from './components/OaiStep';
import { ModStep } from './components/ModStep';
import { CsdStep } from './components/CsdStep';
import { apiFetch } from '@/lib/api';
import { buildSignInPath } from '@/lib/auth';
import { getRecentWeekEndingOptions } from '@/lib/reporting';
import { ChevronRight, ChevronLeft, CheckCircle2, Clock, Calendar } from 'lucide-react';

const EMPTY_FORM_DATA = {
  oai: {
    sicknessAbsences: null,
    shiftReallocations: null,
    additionalShifts: null,
    unauthorizedAbsences: null,
    staffRemoved: null,
  },
  mod: {
    managerIntervention: null,
    recordCorrection: null,
    internalSafeguarding: null,
    supervisoryOversight: null,
  },
  csd: {
    clinicalMonitoring: null,
    healthDeterioration: null,
    hospitalAdmissions: null,
    safeguardingConcerns: null,
    increasedObservations: null,
  }
};

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getRemainingSeconds(editableUntil: string | null) {
  if (!editableUntil) {
    return null;
  }

  return Math.max(0, Math.floor((new Date(editableUntil).getTime() - Date.now()) / 1000));
}

function getAssignmentKey(assignment: any) {
  return `${assignment.site_id}:${assignment.unit_id}`;
}

function getSubmissionStatus(submission: any | null) {
  if (!submission) {
    return "not_started";
  }

  return submission.isEditable ? "submitted" : "locked";
}

export default function SignalInputPage() {
  const currentWeekEnding = getRecentWeekEndingOptions(1)[0];
  const router = useRouter();
  const searchParams = useSearchParams();
  const scopedUnitId = searchParams.get("unit");
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [activeSubmissionId, setActiveSubmissionId] = useState<number | null>(null);
  const [editableUntil, setEditableUntil] = useState<string | null>(null);
  const [remainingEditSeconds, setRemainingEditSeconds] = useState<number | null>(null);

  // Context state (org, site, unit)
  const [context, setContext] = useState<any>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [assignmentStatuses, setAssignmentStatuses] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState(EMPTY_FORM_DATA);

  const redirectToSignIn = () => {
    if (typeof window === "undefined") {
      router.push("/signin");
      return;
    }

    const currentPath = `${window.location.pathname}${window.location.search}`;
    router.push(buildSignInPath(currentPath));
  };

  useEffect(() => {
    const loadContext = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        redirectToSignIn();
        return;
      }

      setPageLoading(true);
      try {
        const res = await apiFetch<{ assignments: any[] }>('/signals/context', { token });
        const assignments = res.assignments || [];
        setContext(assignments);

        if (assignments.length > 0) {
          const scopedAssignment = scopedUnitId
            ? assignments.find((assignment: any) => String(assignment.unit_id) === scopedUnitId)
            : null;
          const savedAssignmentKey = localStorage.getItem('signalInputAssignmentKey');
          const restoredAssignment = savedAssignmentKey
            ? assignments.find((assignment: any) => getAssignmentKey(assignment) === savedAssignmentKey)
            : null;

          setSelectedAssignment(scopedAssignment || restoredAssignment || assignments[0]);
        }
      } catch (err) {
        console.error("Failed to fetch context", err);
      } finally {
        setPageLoading(false);
      }
    };

    loadContext();
  }, [router, scopedUnitId]);

  useEffect(() => {
    if (!selectedAssignment) {
      return;
    }

    localStorage.setItem('signalInputAssignmentKey', getAssignmentKey(selectedAssignment));
  }, [selectedAssignment]);

  useEffect(() => {
    if (!context || context.length === 0) {
      return;
    }

    const loadAssignmentStatuses = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      try {
        const entries = await Promise.all(
          context.map(async (assignment: any) => {
            try {
              const res = await apiFetch<{ submission: any | null }>(
                `/signals/current?unitId=${assignment.unit_id}&siteId=${assignment.site_id}`,
                { token, cache: "no-store" as RequestCache }
              );

              return [getAssignmentKey(assignment), getSubmissionStatus(res.submission)] as const;
            } catch {
              return [getAssignmentKey(assignment), "not_started"] as const;
            }
          })
        );

        setAssignmentStatuses(Object.fromEntries(entries));
      } catch (err) {
        console.error("Failed to load assignment statuses", err);
      }
    };

    loadAssignmentStatuses();
  }, [context]);

  useEffect(() => {
    if (!selectedAssignment) {
      return;
    }

    const loadCurrentSubmission = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        redirectToSignIn();
        return;
      }

      setPageLoading(true);
      try {
        const res = await apiFetch<{ submission: any | null }>(
          `/signals/current?unitId=${selectedAssignment.unit_id}&siteId=${selectedAssignment.site_id}`,
          { token, cache: 'no-store' as RequestCache }
        );

        if (res.submission) {
          setActiveSubmissionId(res.submission.submissionId);
          setSubmissionResult(res.submission);
          setEditableUntil(res.submission.editableUntil || null);
          setRemainingEditSeconds(getRemainingSeconds(res.submission.editableUntil || null));
          setFormData(res.submission.formData);
          setAssignmentStatuses((current) => ({
            ...current,
            [getAssignmentKey(selectedAssignment)]: getSubmissionStatus(res.submission),
          }));
          if (res.submission.isEditable) {
            setSubmitted(false);
            setCurrentStep(0);
          } else {
            setSubmitted(true);
            setCurrentStep(3);
          }
        } else {
          setActiveSubmissionId(null);
          setSubmissionResult(null);
          setEditableUntil(null);
          setRemainingEditSeconds(null);
          setSubmitted(false);
          setCurrentStep(0);
          setFormData(EMPTY_FORM_DATA);
          setAssignmentStatuses((current) => ({
            ...current,
            [getAssignmentKey(selectedAssignment)]: "not_started",
          }));
        }
      } catch (err) {
        console.error("Failed to load current submission", err);
      } finally {
        setPageLoading(false);
      }
    };

    loadCurrentSubmission();
  }, [selectedAssignment, router]);

  useEffect(() => {
    if (!editableUntil) {
      return;
    }

    setRemainingEditSeconds(getRemainingSeconds(editableUntil));

    const timer = window.setInterval(() => {
      const nextRemainingSeconds = getRemainingSeconds(editableUntil);
      setRemainingEditSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds === null || nextRemainingSeconds <= 0) {
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [editableUntil]);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      submitSignal();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const submitSignal = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        redirectToSignIn();
        return;
      }

      const payload = {
        unitId: selectedAssignment.unit_id,
        siteId: selectedAssignment.site_id,
        organisationId: selectedAssignment.organisation_id,
        weekEnding: currentWeekEnding,
        oai: Object.fromEntries(Object.entries(formData.oai).map(([k, v]) => [k, v || 0])),
        mod: Object.fromEntries(Object.entries(formData.mod).map(([k, v]) => [k, v || 0])),
        csd: Object.fromEntries(Object.entries(formData.csd).map(([k, v]) => [k, v || 0])),
      };

      const endpoint = activeSubmissionId ? `/signals/${activeSubmissionId}` : '/signals/submit';
      const result = await apiFetch<any>(endpoint, {
        method: activeSubmissionId ? 'PUT' : 'POST',
        token,
        body: JSON.stringify(payload)
      });

      setSubmissionResult(result);
      setActiveSubmissionId(result.submissionId || activeSubmissionId);
      setEditableUntil(result.editableUntil || null);
      setRemainingEditSeconds(getRemainingSeconds(result.editableUntil || null));
      setFormData(result.formData || formData);
      setAssignmentStatuses((current) => ({
        ...current,
        [getAssignmentKey(selectedAssignment)]: result.isEditable ? "submitted" : "locked",
      }));
      setSubmitted(true);
      setCurrentStep(3);
    } catch (err: any) {
      alert(err.message || "Failed to submit signals");
    } finally {
      setLoading(false);
    }
  };

  if (context && context.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="text-[#1F3A4A]" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#1F3A4A] mb-2">No Active Assignments</h2>
          <p className="text-sm text-gray-500 mb-8">
            You haven't been assigned to any units yet. Please contact your manager or executive to be assigned to a floor or unit.
          </p>
          <button
            onClick={() => router.push('/signin')}
            className="w-full bg-[#1F3A4A] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-[#2c4e62] transition-all"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  if (pageLoading || !selectedAssignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasMultipleAssignments = context.length > 1;
  const selectedAssignmentKey = getAssignmentKey(selectedAssignment);

  const getDisplayStatus = (assignment: any) => {
    const assignmentKey = getAssignmentKey(assignment);

    if (
      assignmentKey === selectedAssignmentKey &&
      activeSubmissionId &&
      !submitted &&
      remainingEditSeconds !== null &&
      remainingEditSeconds > 0
    ) {
      return "in_progress";
    }

    if (
      assignmentKey === selectedAssignmentKey &&
      activeSubmissionId &&
      remainingEditSeconds !== null &&
      remainingEditSeconds <= 0
    ) {
      return "locked";
    }

    return assignmentStatuses[assignmentKey] || "not_started";
  };

  const statusMeta: Record<string, { label: string; className: string }> = {
    not_started: {
      label: "Not Started",
      className: "bg-gray-100 text-gray-500",
    },
    in_progress: {
      label: "In Progress",
      className: "bg-blue-50 text-blue-600",
    },
    submitted: {
      label: "Submitted",
      className: "bg-green-50 text-green-600",
    },
    locked: {
      label: "Locked",
      className: "bg-orange-50 text-orange-600",
    },
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img src="/icon.svg" alt="Carivue" className="h-10 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-[#1F3A4A] mb-1">{selectedAssignment.org_name}- Weekly Signal Input</h1>
            <p className="text-lg font-medium text-gray-500">Submitting for {selectedAssignment.unit_name}</p>
            <p className="text-sm font-medium text-gray-400 mt-1">Week ending {new Date(currentWeekEnding).toLocaleDateString()}</p>
          </div>

          <ProgressBar currentStep={3} />

          <div className="mt-16 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
              <CheckCircle2 className="text-[#1F3A4A]" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-[#1F3A4A] mb-2">Weekly Input Submitted</h2>
            <p className="text-sm text-gray-400 font-medium mb-12">Your weekly stabilisation signals have been successfully recorded.</p>

            <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm max-w-xl mx-auto text-left">
              <h3 className="text-base font-bold text-[#1F3A4A] mb-6 border-b border-gray-50 pb-4">Submission Details</h3>

              <div className="space-y-3 mb-10">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Site:</span>
                  <span className="font-bold text-[#1F3A4A]">{selectedAssignment.site_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Floor/Unit:</span>
                  <span className="font-bold text-[#1F3A4A]">{selectedAssignment.unit_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Week Ending:</span>
                  <span className="font-bold text-[#1F3A4A]">{new Date(submissionResult.weekEnding).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Submission Time:</span>
                  <span className="font-bold text-[#1F3A4A]">{new Date(submissionResult.submittedAt).toLocaleString()}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-[#1F3A4A] mb-6 border-b border-gray-50 pb-4">Input Summary</h3>

              <div className="space-y-3 mb-10">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Operational Load:</span>
                  <span className="font-bold text-[#1F3A4A]">{submissionResult.summary.operationalLoad}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Managerial Stabilisation (MOD):</span>
                  <span className="font-bold text-[#1F3A4A]">{submissionResult.summary.managerialStabilisation}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Clinical Stabilisation (CSD):</span>
                  <span className="font-bold text-[#1F3A4A]">{submissionResult.summary.clinicalStabilisation}</span>
                </div>
              </div>

              <div className="bg-blue-50/50 rounded-xl p-4 flex gap-4 border border-blue-100/50">
                <Clock className="text-blue-500 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1 italic">Edit Window Notice</p>
                  <p className="text-[11px] text-blue-600/70 font-medium leading-relaxed">
                    {remainingEditSeconds && remainingEditSeconds > 0
                      ? `You can still edit this submission for ${formatDuration(remainingEditSeconds)}. After that, the record will lock automatically.`
                      : 'This submission is no longer editable because the 12-hour edit window has expired.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-4 justify-center">
              {remainingEditSeconds && remainingEditSeconds > 0 && (
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setCurrentStep(0);
                  }}
                  className="bg-[#1F3A4A] text-white px-12 py-4 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-all active:scale-95"
                >
                  Edit Submission
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const stepContent = [
    {
      title: "Operational Load (OAI)",
      subtitle: "Report staffing pressures and operational adjustments from this week."
    },
    {
      title: "Managerial Stabilisation (MOD)",
      subtitle: "Capture managerial actions taken to maintain service stability."
    },
    {
      title: "Clinical Stabilisation (CSD)",
      subtitle: "Record residents requiring active clinical monitoring or increased support."
    },
    {
      title: "Confirm Submission",
      subtitle: "Please review and confirm your weekly signal input."
    }
  ];

  if (submitted) {
    // ... (submitted state remains same for now, but I'll update it if needed)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo & Header */}
        <div className="mb-10">
          <img src="/icon.svg" alt="Carivue" className="h-10 mx-auto mb-8" />
          <h1 className="text-2xl font-bold text-[#1F3A4A] mb-1">{selectedAssignment.org_name}- Weekly Signal Input</h1>
          <p className="text-lg font-medium text-gray-500 mb-1">Submitting for {selectedAssignment.unit_name}</p>
          <p className="text-sm text-gray-400 font-medium mb-2">{selectedAssignment.site_name}</p>
          <p className="text-xs text-gray-400 font-medium max-w-md mx-auto">Week ending {new Date(currentWeekEnding).toLocaleDateString()}.</p>
        </div>

        {hasMultipleAssignments ? (
          <div className="mb-10 max-w-4xl mx-auto">
            <div className="text-left mb-6">
              <label className="block text-[10px] font-bold text-[#1F3A4A] uppercase tracking-wider mb-3">Your Assigned Units</label>
              <div className="grid sm:grid-cols-2 gap-4">
                {context.map((assignment: any) => {
                  const status = getDisplayStatus(assignment);
                  const isActive = getAssignmentKey(assignment) === selectedAssignmentKey;

                  return (
                    <button
                      key={getAssignmentKey(assignment)}
                      onClick={() => setSelectedAssignment(assignment)}
                      className={`rounded-2xl border px-5 py-4 text-left transition-all ${
                        isActive
                          ? "border-[#1F3A4A] bg-[#1F3A4A]/5 shadow-sm"
                          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#1F3A4A]">{assignment.unit_name}</p>
                          <p className="mt-1 text-xs font-medium text-gray-400">{assignment.site_name}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${statusMeta[status].className}`}>
                          {statusMeta[status].label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 text-left shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Submitting For</p>
                <p className="mt-2 text-sm font-bold text-[#1F3A4A]">{selectedAssignment.unit_name}</p>
                <p className="mt-1 text-xs font-medium text-gray-400">{selectedAssignment.site_name}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 text-left shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Reporting Week Ending</p>
                <p className="mt-2 text-sm font-bold text-[#1F3A4A]">{new Date(currentWeekEnding).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-10 max-w-3xl mx-auto grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 text-left shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Submitting For</p>
              <p className="mt-2 text-sm font-bold text-[#1F3A4A]">{selectedAssignment.unit_name}</p>
              <p className="mt-1 text-xs font-medium text-gray-400">{selectedAssignment.site_name}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 text-left shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Reporting Week Ending</p>
              <p className="mt-2 text-sm font-bold text-[#1F3A4A]">{new Date(currentWeekEnding).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} />

        {activeSubmissionId && remainingEditSeconds !== null && (
          <div className="mt-8 max-w-2xl mx-auto rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-4 text-left">
            <div className="flex items-start gap-3">
              <Clock className="text-blue-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Editing Active Submission</p>
                <p className="text-sm font-medium text-blue-700">
                  {remainingEditSeconds > 0
                    ? `Time remaining to update this submission: ${formatDuration(remainingEditSeconds)}`
                    : 'The edit window for this submission has expired.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step Title Section (Added for Design Alignment) */}
        <div className="mt-16 mb-10">
          <h2 className="text-xl font-bold text-[#1F3A4A] mb-1">{stepContent[currentStep].title}</h2>
          <p className="text-sm text-gray-400 font-medium">{stepContent[currentStep].subtitle}</p>
        </div>

        {/* Form Content */}
        <div className="mb-12">
          {currentStep === 0 && <OaiStep data={formData.oai} onChange={(d) => setFormData({ ...formData, oai: d })} />}
          {currentStep === 1 && <ModStep data={formData.mod} onChange={(d) => setFormData({ ...formData, mod: d })} />}
          {currentStep === 2 && <CsdStep data={formData.csd} onChange={(d) => setFormData({ ...formData, csd: d })} />}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 max-w-2xl mx-auto">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center gap-2 bg-white border border-gray-100 text-[#1F3A4A] px-12 py-4 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          )}
          <button
            disabled={loading}
            onClick={handleNext}
            className={`flex items-center justify-center gap-2 bg-[#1F3A4A] text-white px-20 py-4 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-all active:scale-95 
              ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              ${currentStep === 0 ? 'w-full max-w-lg' : ''}`}
          >
            {loading ? 'Submitting...' : currentStep === 2 ? (activeSubmissionId ? 'Update Submission' : 'Confirm') : 'Next'}
            {!loading && currentStep < 2 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </main>
  );
}
