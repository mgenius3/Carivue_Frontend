"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CarivueLogo } from "@/components/ui/CarivueLogo";
import { Info, X } from "lucide-react";

/* ─── icon helpers ─── */
function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="12" fill="#C7791A" />
      <path d="M7 12.5L10.5 16L17 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-white opacity-40">
      <path d="M14 28H8L14 16H20L14 28ZM30 28H24L30 16H36L30 28Z" fill="currentColor" />
    </svg>
  );
}

/* ─── Custom Icons ─── */
function OaiIcon() {
  return <Image src="/ovi.png" alt="OAI Icon" width={32} height={32} />;
}

function CsdIcon() {
  return <Image src="/csd.png" alt="CSD Icon" width={32} height={32} />;
}

function ModIcon() {
  return <Image src="/mod.png" alt="MOD Icon" width={32} height={32} />;
}

/* ─── pricing data ─── */
const plans = [
  {
    name: "Single Service",
    description: "For organisations operating one care service.",
    price: "$199",
    period: "/month",
    features: [
      "1 service/site included",
      "Full CVI score + trends",
      "Signal collection from staff",
      "Executive dashboard",
      "Email & in-app alerts",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Multi-Service",
    description: "For growing groups scaling operations across regions.",
    price: "Custom",
    period: " pricing",
    features: [
      "Unlimited services / policies",
      "Integration with governance suite",
      "Automated risk scoring",
      "Dedicated account rep",
      "Priority support",
    ],
    cta: "Contact Us",
    highlighted: true,
  },
  {
    name: "Multi-Service",
    description: "For mid-size operators managing multiple services.",
    price: "$399",
    period: "/month",
    features: [
      "Multiple reporting flows set",
      "Comparative analytics across sites",
      "Cross-service review & risk monitoring",
      "Custom alerts & progress tracking",
      "Portfolio governance dashboard",
    ],
    cta: "Get Started",
    highlighted: false,
  },
];

const howItWorksFeatures = [
  {
    title: "Overtime Amplification Index (OAI)",
    icon: <OaiIcon />,
    desc: "Measures the degree to which staffing coverage relies on overtime, additional shifts, or reactive cover beyond planned capacity.",
  },
  {
    title: "Clinical Stabilisation Density (CSD)",
    icon: <CsdIcon />,
    desc: "Measures the level of clinical or risk-related oversight required to maintain safe and stable service delivery.",
  },
  {
    title: "Manual Override Density (MOD)",
    icon: <ModIcon />,
    desc: "Measures the frequency of managerial intervention required to correct or stabilise operational processes.",
  },
];

export default function Home() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const activeFeature = activeModal
    ? howItWorksFeatures.find(f => f.title === activeModal)
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ══════════════════════════════════════════════
          HEADER / NAVBAR
         ══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-[#EEF5F3]/80 backdrop-blur border-b border-transparent">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <CarivueLogo />

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-text">
            <Link href="#home" className="hover:text-primary transition">Home</Link>
            <Link href="#how-it-works" className="hover:text-primary transition">How it Works</Link>
            <Link href="#pricing" className="hover:text-primary transition">Pricing</Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/signin"
              className="hidden sm:inline-flex text-sm font-semibold text-text hover:text-primary transition"
            >
              Log in
            </Link>
            <Link
              href="/#contact"
              className="inline-flex items-center text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-md hover:bg-primary/90 transition shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* ══════════════════════════════════════════════
          HERO SECTION
         ══════════════════════════════════════════════ */}
      <section id="home" className="relative overflow-hidden bg-[#EEF5F3] pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div className="animate-fade-in-up md:pr-10">
            <div className="relative inline-block mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-text leading-[1.15] tracking-tight relative z-10 block">
                See Hidden<br />Strain Before It<br />Hits Your Team
              </h1>
              <Image
                src="/Vector 32.png"
                alt="Highlight curve"
                width={300}
                height={20}
                className="absolute -bottom-3 lg:-bottom-4 left-0 w-full z-0"
              />
            </div>
            <p className="text-base text-gray-700 max-w-lg mb-8 leading-relaxed font-medium mt-2">
              Carivue provides real-time operational visibility for care services, aggregating workforce signals and clinical indicators to highlight systemic risk and prevent operational failure.
            </p>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center bg-primary text-white px-8 py-3.5 rounded-md font-semibold text-base hover:bg-primary/90 transition-all w-full sm:w-auto shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Right column — dashboard preview */}
          <div className="relative flex justify-center lg:justify-end animate-float">
            <Image
              src="/Group 138.png"
              alt="Carivue dashboard overview"
              width={650}
              height={450}
              className="w-full max-w-[650px] object-contain drop-shadow-2xl translate-y-8"
              priority
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW CARIVUE WORKS
         ══════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-[#FAF8FC] py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold text-text mb-4">How Carivue Works</h2>
            <p className="text-gray-600 leading-relaxed font-medium text-sm max-w-md">
              Carivue identifies system-specific indicators of operational strain. Instead of tracking outcomes retrospectively, Carivue captures baseline inputs of stabilisation effort to give management leaders 14-days early warnings indicator of potential crisis before CQC compliance falls or staff burnout. Through continuous real-time inputs natively generated from staff, Care managers are empowered to review hidden risk hotspots earlier, deploy rapid intervention, and stabilise care operation.
            </p>
          </div>

          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {howItWorksFeatures.map((feature) => (
              <button
                key={feature.title}
                className="flex gap-5 items-start cursor-pointer group pt-2 pb-1 w-full text-left focus:outline-none"
                onClick={() => setActiveModal(feature.title)}
              >
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100/80 shrink-0 flex items-center justify-center group-hover:shadow-md group-hover:border-gray-200 transition-all">
                  {feature.icon}
                </div>
                <div className="w-full flex justify-between items-start gap-2 pt-1">
                  <div>
                    <h3 className="text-xl md:text-[28px] font-bold text-text mb-2 leading-tight md:leading-none tracking-normal group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-sm">{feature.desc}</p>
                  </div>
                  <div
                    className="p-1.5 group-hover:bg-gray-100 rounded-full transition-colors flex shrink-0"
                    aria-hidden="true"
                  >
                    <Info className="w-5 h-5 text-gray-400 group-hover:text-secondary transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BUILT FOR MODERN CARE SERVICES
         ══════════════════════════════════════════════ */}
      <section className="bg-white py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-text mb-3">Built for Modern Care Services</h2>
              <p className="text-gray-500 font-medium text-sm max-w-md">
                Carivue safely builds infrastructure to accurately translate real-time operational strain into quantifiable markers for management teams.
              </p>
            </div>
            <Link href="#contact" className="hidden md:inline-flex bg-primary text-white px-6 py-2.5 rounded-md font-semibold text-sm hover:bg-primary/90 transition-all">
              Get Started
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Residential Care",
                desc: "Identify early indicators signalling staff turnover, managing sickness absence and evaluating reliance on agency staff. Evaluate overall workforce pressure, manage absenteeism accurately and preserve safe service delivery.",
                img: "/hospital-building/cuate.svg",
              },
              {
                title: "Domiciliary Care",
                desc: "Real-time strain score helping staff highlight pressure points in community settings. Optimise travel-to-care ratios, balance daily demands, and manage safe intervention.",
                img: "/hospital-family-visit/bro.svg",
              },
              {
                title: "Supported Living",
                desc: "Uncover hidden gaps in staffing adjustments for staff teams supporting vulnerable users. Evaluate holistic overall indicators of employee burnout, sickness and safeguarding safety.",
                img: "/hospital-wheelchair/cuate.svg",
              },
            ].map((service) => (
              <div key={service.title} className="group flex flex-col items-center text-center">
                <div className="w-full flex items-center justify-center mb-8 h-[220px]">
                  <Image
                    src={service.img}
                    alt={service.title}
                    width={400}
                    height={300}
                    className="w-[85%] h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-[22px] font-bold text-text mb-3">{service.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium px-4">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY CARE ORGANISATIONS USE CARIVUE
         ══════════════════════════════════════════════ */}
      <section className="bg-[#FAF8FC] py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <div className="order-2 lg:order-1 pr-6">
            <h2 className="text-3xl font-bold text-text mb-10">
              Why Care Organisations<br />Use Carivue
            </h2>
            <div className="space-y-6">
              {[
                "Detect upward shifts in effort and strain a minimum of 14 days earlier.",
                { strong: "Instantly pinpoint which units or locations need immediate supervision and safeguarding.", text: " Instantly pinpoint which units or locations need immediate supervision and safeguarding." },
                "Maintain complete governance without adding burden to staff workloads.",
                "Get clear governance visibility across multiple services.",
                "Prevent staff burnout and drop-outs before they start snowballing.",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <CheckIcon className="shrink-0 mt-0.5" />
                  <p className="text-text text-sm leading-relaxed font-medium mb-0">
                    {typeof item === "string" ? item : <><span className="font-bold">{item.strong}</span></>}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end order-1 lg:order-2 animate-float">
            <Image
              src="/Frame 2147224129 (2).png"
              alt="Consider Reviewing Panel & Strain Distribution"
              width={500}
              height={400}
              className="w-full max-w-[500px] object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHAT MAKES CARIVUE DIFFERENT
         ══════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-[#DDF2EC]/50 to-white py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative flex justify-center lg:justify-start animate-float" style={{ animationDelay: "1s" }}>
            <Image
              src="/Frame 2147224129 (3).png"
              alt="Organisation Strain Trend Dashboard"
              width={550}
              height={380}
              className="w-full max-w-[550px] object-contain drop-shadow-2xl"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-text mb-8">
              What Makes Carivue<br />Different
            </h2>
            <p className="text-sm font-semibold text-text leading-relaxed mb-6">
              Most care sector technology focus on what went wrong. Carivue focuses on the <span className="text-secondary">predictive pattern to what is going wrong</span>.
            </p>
            <p className="text-sm font-medium text-gray-600 leading-relaxed">
              Instead of tracking outcomes retrospectively, Carivue captures stabilization effort required to keep services running safely. By merging workforce effort, managerial intervention, and clinical oversight, the platform reveals hidden operational strain pathways that goes unnoticed through CQC reporting.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRICING
         ══════════════════════════════════════════════ */}
      <section id="pricing" className="bg-[#FAF8FC] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text mb-4">Choose a Plan That Fits Your Organisation</h2>
            <p className="text-gray-500 text-sm font-medium max-w-2xl mx-auto">
              Carivue pricing is based on the number of facilities (care homes) and the total volume of staff in your domiciliary services and operational support staff.
            </p>

            {/* Toggle */}
            <div className="inline-flex mt-8 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              <button className="px-6 py-2 rounded-md text-[15px] font-bold bg-primary shadow text-white transition-colors">Monthly</button>
              <button className="px-6 py-2 rounded-md text-[15px] font-bold text-gray-500 bg-transparent hover:text-text transition-colors">Yearly</button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl border flex flex-col items-center text-center transition-all overflow-hidden ${plan.highlighted
                  ? "bg-[#1B2936] text-white border-transparent shadow-xl scale-[1.03] z-10"
                  : "bg-white border-gray-100 shadow-sm"
                  }`}
              >
                <div className="p-8 pb-6 flex flex-col items-center text-center w-full">
                  <h3 className={`text-lg font-bold mb-3 ${plan.highlighted ? "text-white" : "text-text"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs leading-relaxed mb-6 h-10 ${plan.highlighted ? "text-gray-300" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                  <div className="flex items-end justify-center gap-1">
                    <span className={`text-[2rem] font-bold leading-none ${plan.highlighted ? "text-white" : "text-text"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-xs font-semibold pb-1 ${plan.highlighted ? "text-gray-400" : "text-gray-400"}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                <div className={`w-full max-w-[calc(100%-1.5rem)] m-3 p-6 pt-8 flex-1 flex flex-col items-center rounded-xl ${plan.highlighted ? "bg-white shadow-sm" : "bg-[#F9FAFB] border border-gray-100/60"}`}>
                  <ul className="space-y-4 mb-8 flex-1 text-left w-full pl-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-xs font-medium">
                        <div className="mt-0.5 rounded-full p-0.5 shrink-0 bg-[#1B2936] text-white">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                        </div>
                        <span className="text-text">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="#contact"
                    className={`block w-full text-center py-3.5 rounded-md font-semibold text-sm transition-all border ${plan.highlighted
                      ? "bg-[#1B2936] border-transparent text-white hover:bg-[#2c3d4f]"
                      : "bg-white border-primary text-primary hover:bg-gray-50"
                      }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BOTTOM DARK SECTION: TESTIMONIALS & CONTACT
         ══════════════════════════════════════════════ */}
      <section id="contact" className="bg-[#1C2028] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left - Testimonial / Insights */}
          <div>
            <h2 className="text-[2.5rem] font-bold text-white mb-6 leading-tight">
              Insights From<br />Care Leaders
            </h2>
            <p className="text-gray-400 text-sm mb-12 leading-relaxed">
              Carivue partners directly with frontline care leaders and organizations who embrace operational transparency to bring quality care, safety and staff retention to frontline team workers.
            </p>

            <div className="relative pl-6 border-l-2 border-white/20">
              <QuoteIcon />
              <p className="text-white text-base leading-loose mt-4 mb-8 font-medium italic">
                &ldquo;Until we used Carivue, we had no single view into the real pressure our teams faced. The stability index helped us anticipate issues two weeks before they surfaced in incident reports. This isn&apos;t just software — it&apos;s peace of mind for anyone accountable for care quality.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-white/50 bg-white/5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-xs mb-1">Helen Lawrence</p>
                  <p className="text-gray-400 text-[11px]">Registered Manager</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="bg-[#242938] rounded-2xl p-8 sm:p-10 max-w-[480px] mx-auto w-full">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 scale-125 origin-center">
                <CarivueLogo className="[&_path]:stroke-white [&_span]:text-white" />
              </div>
            </div>
            <h3 className="text-[32px] font-bold text-white text-center mb-8">Get Started</h3>
            
            <div className="bg-[#F8FBFF] rounded-lg p-4 flex items-center gap-3 mb-8">
              <Info className="w-5 h-5 text-[#3b82f6] shrink-0" />
              <p className="text-[14px] font-medium text-[#3b82f6]">
                Carivue does not require resident-level data.
              </p>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <label className="block text-white font-medium text-[16px]">Email</label>
                <input
                  type="email"
                  placeholder="Enter your work email"
                  className="w-full bg-white border-0 rounded-lg px-4 py-3 text-[15px] text-gray-800 focus:outline-none placeholder:text-gray-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium text-[16px]">Message</label>
                <textarea
                  placeholder="Type your message"
                  rows={4}
                  className="w-full bg-white border-0 rounded-lg px-4 py-3 text-[15px] text-gray-800 focus:outline-none placeholder:text-gray-400 resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#D48625] text-white py-3 mt-2 rounded-lg font-bold text-[16px] hover:bg-[#c07820] transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
         ══════════════════════════════════════════════ */}
      <footer className="bg-[#1C2028] py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16c4.07 0 7.79-1.52 10.614-4.022" stroke="white" strokeWidth="5" strokeLinecap="round" />
            </svg>
            <span className="text-white font-bold text-base tracking-wide">Carivue</span>
            <span className="text-white text-xs ml-2">An Intelligence Layer Product</span>
          </div>

          {/* Social Icons? User added email form at bottom? Need to be careful */}
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="relative">
              <input type="email" placeholder="Enter your email here" className="bg-[#242A34] text-white text-sm rounded-full pl-6 pr-12 py-2 border border-white/10 w-64 focus:outline-none" />
              <button className="absolute right-1 top-1 bottom-1 bg-secondary rounded-full w-8 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-500 font-medium">
          <p>© 2025 Carivue Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition">Terms and Conditions</Link>
            <Link href="#" className="hover:text-white transition">Privacy Policy</Link>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════
          INFO MODAL
         ══════════════════════════════════════════════ */}
      {activeModal && activeFeature && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#1c1c1c]/80 backdrop-blur-sm transition-opacity"
            onClick={() => setActiveModal(null)}
          ></div>
          <div className="relative bg-[#202020] w-full max-w-md rounded-xl p-8 shadow-2xl animate-fade-in-up border border-white/10 mx-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-2"
            >
              <X size={20} />
            </button>
            <div className="bg-white rounded-lg p-6 mb-4">
              <h3 className="text-lg font-bold text-text mb-3 leading-tight">{activeFeature.title}</h3>
              <p className="text-gray-800 text-[15px] leading-relaxed font-medium">{activeFeature.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
