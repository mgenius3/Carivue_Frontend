"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from './components/ProgressBar';
import { OaiStep } from './components/OaiStep';
import { ModStep } from './components/ModStep';
import { CsdStep } from './components/CsdStep';
import { apiFetch } from '@/lib/api';
import { getRecentWeekEndingOptions } from '@/lib/reporting';
import { ChevronRight, ChevronLeft, CheckCircle2, Clock, Calendar } from 'lucide-react';

export default function SignalInputPage() {
  const weekEndingOptions = getRecentWeekEndingOptions(2);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  
  // Context state (org, site, unit)
  const [context, setContext] = useState<any>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [weekEnding, setWeekEnding] = useState(weekEndingOptions[0]);

  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    // Fetch coordinator context
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }

    apiFetch<{ assignments: any[] }>('/signals/context', { token })
      .then(res => {
        setContext(res.assignments);
        if (res.assignments.length > 0) {
          setSelectedAssignment(res.assignments[0]);
        }
      })
      .catch(err => console.error("Failed to fetch context", err));
  }, [router]);

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
        router.push('/signin');
        return;
      }

      const payload = {
        unitId: selectedAssignment.unit_id,
        siteId: selectedAssignment.site_id,
        organisationId: selectedAssignment.organisation_id,
        weekEnding: weekEnding,
        oai: Object.fromEntries(Object.entries(formData.oai).map(([k, v]) => [k, v || 0])),
        mod: Object.fromEntries(Object.entries(formData.mod).map(([k, v]) => [k, v || 0])),
        csd: Object.fromEntries(Object.entries(formData.csd).map(([k, v]) => [k, v || 0])),
      };

      const result = await apiFetch<any>('/signals/submit', {
        method: 'POST',
        token,
        body: JSON.stringify(payload)
      });

      setSubmissionResult(result);
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

  if (!selectedAssignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img src="/icon.svg" alt="Carivue" className="h-10 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-[#1F3A4A] mb-1">{selectedAssignment.org_name}- Weekly Signal Input</h1>
            <p className="text-lg font-medium text-gray-500">{selectedAssignment.site_name}</p>
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
                    You may edit this submission for the next 12 hours if corrections are required. After this period, the record will be locked.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-4 justify-center">
              <button 
                onClick={() => setSubmitted(false)}
                className="bg-[#1F3A4A] text-white px-12 py-4 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-all active:scale-95"
              >
                Edit Submission
              </button>
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
          <p className="text-lg font-medium text-gray-500 mb-2">{selectedAssignment.site_name}</p>
          <p className="text-xs text-gray-400 font-medium max-w-md mx-auto">Submit this week's stabilisation signals for your site. Takes less than 2 minutes.</p>
        </div>

        {/* Selection Row */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-10 max-w-2xl mx-auto">
          <div className="flex-1 w-full text-left">
            <label className="block text-[10px] font-bold text-[#1F3A4A] uppercase tracking-wider mb-2">Select Floor/Unit</label>
            <div className="relative">
              <select 
                value={selectedAssignment.unit_id}
                onChange={(e) => {
                  const assignment = context.find((a: any) => a.unit_id === parseInt(e.target.value));
                  setSelectedAssignment(assignment);
                }}
                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1F3A4A] shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#1F3A4A]/5"
              >
                {context.map((a: any) => (
                  <option key={a.unit_id} value={a.unit_id}>{`${a.site_name} - ${a.unit_name}`}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex-1 w-full text-left">
            <label className="block text-[10px] font-bold text-[#1F3A4A] uppercase tracking-wider mb-2">Week Ending</label>
            <div className="relative">
              <select 
                value={weekEnding}
                onChange={(e) => setWeekEnding(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#1F3A4A] shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#1F3A4A]/5"
              >
                {weekEndingOptions.map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar currentStep={currentStep} />

        {/* Step Title Section (Added for Design Alignment) */}
        <div className="mt-16 mb-10">
          <h2 className="text-xl font-bold text-[#1F3A4A] mb-1">{stepContent[currentStep].title}</h2>
          <p className="text-sm text-gray-400 font-medium">{stepContent[currentStep].subtitle}</p>
        </div>

        {/* Form Content */}
        <div className="mb-12">
          {currentStep === 0 && <OaiStep data={formData.oai} onChange={(d) => setFormData({...formData, oai: d})} />}
          {currentStep === 1 && <ModStep data={formData.mod} onChange={(d) => setFormData({...formData, mod: d})} />}
          {currentStep === 2 && <CsdStep data={formData.csd} onChange={(d) => setFormData({...formData, csd: d})} />}
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
            {loading ? 'Submitting...' : currentStep === 2 ? 'Confirm' : 'Next'}
            {!loading && currentStep < 2 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </main>
  );
}
