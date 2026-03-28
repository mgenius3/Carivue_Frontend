"use client";

import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Accordion } from "@/components/dashboard/Accordion";
import { AddSiteModal } from "@/components/dashboard/modals/AddSiteModal";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { apiFetch } from "@/lib/api";

const faqItems = [
  {
    question: "What is Carivue?",
    answer: "Carivue is an advanced clinical and operational surveillance platform designed to provide early visibility into strain and instability within care services. It uses data-driven indices to help care leaders make proactive decisions."
  },
  {
    question: "What is the Carivue Stability Index?",
    answer: "The Carivue Stability Index (CSI) is a composite metric that measures the overall level of operational strain within a service. It quantifies deviations from a service's normal operating baseline to identify emerging risks."
  },
  {
    question: "How is the Carivue Score calculated?",
    answer: "Carivue scores are calculated using a proprietary algorithm that analyzes multiple data layers, including workforce capacity (OAI), managerial intervention (MOD), and clinical stabilization (CSD), comparing them against a 6-week rolling equilibrium."
  },
  {
    question: "How often do we submit data?",
    answer: "Data is typically submitted on a weekly basis, allowing for consistent monitoring of trends and patterns. The platform provides a signal submission interface for easy reporting of weekly operational data."
  }
];

export default function HelpSupportPage() {
  const [feedback, setFeedback] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = React.useState(false);
  const feedbackRef = React.useRef<HTMLTextAreaElement | null>(null);

  return (
    <DashboardLayout
      title="Executive Dashboard"
      primaryActionLabel="Add New Site"
      onPrimaryAction={() => setIsAddSiteModalOpen(true)}
    >
      <div className="flex flex-col gap-10">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3A4A] mb-1">Help & Support</h1>
          <p className="text-sm text-gray-400 font-medium tracking-wide">Find answers, get assistance, and learn more about Carivue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Submit Ticket Card */}
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#F9FAFB] rounded-lg">
                <MessageSquare size={18} className="text-[#1F3A4A]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1F3A4A]">Submit Support Ticket</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Get in touch with our support team for personalized assistance</p>
              </div>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!feedback) return;

                setSubmitting(true);
                try {
                  const token = localStorage.getItem('token') || "";
                  await apiFetch('/support/tickets', {
                    method: 'POST',
                    body: JSON.stringify({ message: feedback }),
                    token
                  });
                  alert("Support ticket submitted successfully!");
                  setFeedback("");
                } catch (err: any) {
                  alert(err.message);
                } finally {
                  setSubmitting(false);
                }
              }}
              className="mt-8 space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1F3A4A]">Feedback*</label>
                <textarea 
                  name="feedback"
                  placeholder="Feedback" 
                  rows={5}
                  required
                  ref={feedbackRef}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={submitting}
                  className="w-full border border-gray-100 rounded-xl px-4 py-4 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-medium resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setFeedback("")}
                  className="px-6 py-2 rounded-lg text-xs font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
                >
                  Close
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-2 rounded-lg text-xs font-bold text-white bg-[#1F3A4A] hover:bg-[#2c4e62] transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>

          {/* Contact Support Card */}
          <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#F9FAFB] rounded-lg">
                  <Mail size={18} className="text-[#1F3A4A]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1F3A4A]">Contact Support</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Get in touch with our support team for personalized assistance</p>
                </div>
              </div>

              <div className="mt-10 space-y-8">
                <div className="flex items-start gap-4">
                   <div className="p-2.5 bg-[#FFF8F1] rounded-xl">
                      <Phone size={18} className="text-secondary" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-[#1F3A4A]">Phone</p>
                      <p className="text-[13px] text-gray-400 font-bold mt-1 tracking-tight">1-800-CARIVUE</p>
                      <p className="text-[10px] text-gray-400 font-medium">Mon-Fri, 9am - 5pm ET</p>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="p-2.5 bg-[#FFF8F1] rounded-xl">
                      <Mail size={18} className="text-secondary" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-[#1F3A4A]">Email</p>
                      <p className="text-[13px] text-gray-400 font-bold mt-1 tracking-tight">support@carivue.com</p>
                      <p className="text-[10px] text-gray-400 font-medium">24/7 response</p>
                   </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => feedbackRef.current?.focus()}
              className="w-full bg-[#1F3A4A] text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-[#2c4e62] transition-colors mt-12"
            >
              Submit Feedback / Support Ticket
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-[#1F3A4A] mb-1">Frequently Asked Questions</h2>
          <p className="text-sm text-gray-400 font-medium tracking-wide mb-8">Answers to common questions about Carivue</p>
          
          <div className="bg-transparent px-2">
            <Accordion items={faqItems} />
          </div>

          <button className="w-full mt-10 py-3 rounded-xl text-sm font-bold text-gray-400 border border-gray-100 bg-white/50 hover:bg-gray-50 transition-colors">
            View All FAQs
          </button>
        </div>
      </div>
      <AddSiteModal
        isOpen={isAddSiteModalOpen}
        onClose={() => setIsAddSiteModalOpen(false)}
      />
    </DashboardLayout>
  );
}
