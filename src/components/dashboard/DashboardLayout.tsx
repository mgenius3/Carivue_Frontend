"use client";

import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  role?: "executive" | "manager";
  onAddOrg?: () => void;
}

export function DashboardLayout({ 
  children, 
  title, 
  role = "executive",
  onAddOrg
}: DashboardLayoutProps) {
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
          onAddOrg={onAddOrg}
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
