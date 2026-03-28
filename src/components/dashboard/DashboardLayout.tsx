"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { apiFetch } from "@/lib/api";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role?: "executive" | "manager";
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

export function DashboardLayout({ 
  children, 
  title, 
  role = "executive",
  primaryActionLabel,
  onPrimaryAction
}: DashboardLayoutProps) {
  const [profile, setProfile] = useState<{
    first_name?: string;
    last_name?: string;
    organisation_name?: string;
  } | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      return;
    }

    apiFetch<{
      first_name?: string;
      last_name?: string;
      organisation_name?: string;
    }>("/settings/profile", { token })
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  const userName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim()
    : undefined;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative">
        {/* Navbar */}
        <Navbar 
          title={title} 
          role={role.charAt(0).toUpperCase() + role.slice(1)} 
          userName={userName || undefined}
          orgName={profile?.organisation_name || undefined}
          primaryActionLabel={primaryActionLabel}
          onPrimaryAction={onPrimaryAction}
        />

        {/* Content */}
        <main className="mt-16 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
